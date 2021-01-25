import React, { useState, useEffect } from "react";
import { Redirect, withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap'
import { Auth } from 'aws-amplify';
import * as d3 from 'd3'

import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

import Navbar from './components/navbar'
import Searchbar from './components/searchbar'
import SearchFilters from './components/search-filters'
import SingleStat from './components/single-stat'
import SectionTitle from './components/section-title'
import PrismPieChart from './components/pie-chart'
import PrismLineChart from './components/line-chart'
import PrismBarChart from './components/bar-chart'
import PrismSunburst from './components/sunburst-chart'
import PrismScatterplot from './components/scatterplot'
import PrismChoropleth from './components/choropleth'
import MainTable from './components/tabulator'


import './index.css'
import 'react-tabulator/lib/styles.css';
import 'react-tabulator/css/bootstrap/tabulator_bootstrap.min.css';
import 'react-tabulator/lib/styles.css';




const initialStats = [
  {
    color: 'red',
    stats: [
      { title: 'Trials', metric: '--' }
    ]
  },
  {
    color: 'orange',
    stats: [
      { title: 'Participants', metric: '--' }
    ]
  },
  {
    color: 'yellow',
    stats: [
      { title: 'Interventions', metric: '--' }
    ]
  },
  {
    color: 'green',
    stats: [
      { title: 'Outcomes', metric: '--' }
    ]
  },
  {
    color: 'blue',
    stats: [
      { title: 'Sponsors', metric: '--' }
    ]
  },
  {
    color: 'violet',
    stats: [
      { title: 'Sites', metric:'--' }
    ]
  }
]



function DashboardRoute(props) {

  const [currentUser, setCurrentUser] = useState("")

  useEffect((props) => {
    const getCurrentAuthenticatedUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser()
        setCurrentUser(user)
      } catch (error) {
        setCurrentUser(undefined)
      }
    }
    getCurrentAuthenticatedUser()
  }, [currentUser])


  const [airtableFilters, setAirtableFilters] = useState("")


  const [updateRequested, setUpdatedRequested] = useState("")

  // Handles The Update Button
  const onUpdateButtonClicked = (e) => {

    setUpdatedRequested(Date())
    closeSidebar()

    let filters_list = getAirtableFilters()
    let filts_final = formatFiltersForAirtable(filters_list)
    setAirtableFilters(filts_final)


  }

  // Dictionary responsible for normalizing names - airtable key is the value and regular text name is the key
  const dropdownItems = {
    "Start Year": "Start_Year",
    "Age Groups": "Age_Groups",
    "Sponsors": "Sponsor",
    "Sponsor Types": "Sponsor_Type",
    "Study Types": "Study_Type",
    "Outcomes": "Outcome_Concepts",
    "Settings": "Facility_Settings",
    "Regions": "Geography_Regions",
    "Interventions": "Intervention_Types",
    "Type": "Study_Type",
    "Masking": "Masking_Clean",
    "Single/Multi Site": "Single_Multi_Site",
    "Healthy Volunteers": "Healthy_Volunteers",
    "Target Enrollment": "Enrollment_Target",
    "Randomization": "Randomization",
    "Phase": "Phase",
    "Status": "Status",
    "Purpose": "Purpose"
  }








  const [trialsFilters, setTrialsFilters] = useState({})
  const [populationFilters, setPopulationFilters] = useState({})
  const [interventionsFilters, setInterventionsFilters] = useState({})
  const [outcomesFilters, setOutcomesFilters] = useState({})
  const [sponsorsFilters, setSponsorsFilters] = useState({})
  const [geographyFilters, setGeographyFilters] = useState({})
  const [initialFilterLoadComplete, setInitialFilterLoadComplete] = useState(false)


  var Airtable = require('airtable');
  var base = new Airtable({apiKey: 'keygbNFWvzaP9t8xi'}).base('appmh47tLfNhe7i80');


////////////////////////////////////////////////////////////////////////

// HELPER FUNCTION SECTION

//////////////////////////////////////////////////////////////////////

  // funtion that sums the values of a list
  function sum(list1){
    const total = list1.reduce(
        (previousScore, currentScore, index)=>previousScore+currentScore,
        0);
        //console.log(total);
      return total;
  }

  // takes a full dictionary and an empty dictionary and sorts the full one into the empty one
  function sortDictionary(dictionary, new_dict){
    var items = Object.keys(dictionary).map(function(key) {
      return [key, dictionary[key]];
    });

    items.sort();

    for (var item of items){
      new_dict[item[0]] = item[1]
    }
  }

  // formats a dictionary correctly for the filters
  function create_filter_dict(set, unique_dict){
    for (var i of set) {
        i = String(i)
        unique_dict[i] = true;
    }
  }

  // bascially an accumulator where 'dictionary' holds the key 'key' and the value is the occurences of key
  function countOccurrences(dictionary, key){
    if(key in dictionary){
      dictionary[key]+=1;
    } else {
      dictionary[key] = 1
    }
  }

  // helper that formats a dictionary for a pie chart
  function pieFormatting(dictionary, pie_data){
    var keys = Object.keys(dictionary);
    var value = Object.values(dictionary);
    for (var i=0; i<keys.length; i++){
      var new_dict = {};
      new_dict["id"] = keys[i];
      new_dict["label"] = keys[i];
      new_dict["value"] = value[i];
      pie_data.push(new_dict)
    }
  }

  // this creates the data for a bar chart given a dictionary of name and number
  function barFormatting(dictionary, bar_data, bar_formatted, bar_type){
    var keys = Object.keys(dictionary);
    var value = Object.values(dictionary);
    for (var i=0; i<keys.length; i++){
      var new_dict = {};
      new_dict[[bar_type]] = keys[i];
      new_dict[[keys[i]]] = value[i];
      bar_data.push(new_dict)
    }

    bar_formatted["data"] = bar_data;
    bar_formatted["group_keys"] = keys
  }

  function lineFormatting(dictionary, line_data, line_formatted){
    var keys = Object.keys(dictionary);
    var value = Object.values(dictionary);
    for (var i=0; i<keys.length; i++){
      var new_dict = {};
      new_dict["x"] = keys[i];
      new_dict["y"] = value[i];
      line_data.push(new_dict)
    }
    line_formatted["id"] = 0;
    line_formatted["data"] = line_data;
  }

  function geogFormatting(dictionary, geog_data){
    var keys = Object.keys(dictionary);
    var value = Object.values(dictionary);
    for (var i=0; i<keys.length; i++){
      var new_dict = {};
      new_dict["id"] = keys[i];
      new_dict["value"] = value[i];
      geog_data.push(new_dict)
    }
  }

  // helper function to get the value related to a specified key
  function getVal(dictionary, key){
    return dictionary[key];
  }


  ////////////////////////////////////////////////////////////////////////

  // FILTER HANDLING SECTION

  //////////////////////////////////////////////////////////////////////

  // to add new filters
  const all_filters = {
    "Trials": ['Masking_Clean', 'Phase', 'Purpose', 'Randomization', 'Status',  'Study_Type'],
    "Populations": ['Age_Groups', "Enrollment_Target", "Facility_Settings", 'Healthy_Volunteers', 'Single_Multi_Site'],
    "Interventions": ["Intervention_Types"],
    "Outcomes": ['Outcome_Concepts'],
    "Sponsors": ['Sponsor_Type'],
    "Geography": ["Geography_Regions", "Geography_Countries"]
  }

  // this creates and returns a dictionary list of dictionaries
  // there is one dictionary for every checkbox that has been unchecked
  function getAirtableFilters(){
    var filter_dict = generateFiltersPostBody()
    var store = []
    var sections = Object.keys(filter_dict)
    //console.log('Filter Dictionary: ', filter_dict)
    for (var section of sections){

      var section_keys = Object.keys(filter_dict[section])

      for (var sub_section of section_keys){

        var sub_section_keys = Object.keys(filter_dict[section][sub_section])
          for (var key of sub_section_keys){

            if (filter_dict[section][sub_section][key] === false) {

              if (sub_section === "Sponsors"){
                let new_dict = {"Sponsor_Type": key}
                store.push(new_dict)
              } else if (section === "Geography"){
                let new_dict = {"Geography_Countries": key}
                store.push(new_dict)
              } else {
                let new_dict = {[dropdownItems[sub_section]]: key}
                store.push(new_dict)
              }
            }
          }
      }
    }

    //console.log("filters that have been stored: ", store)
    return store
  }


// formats the filter string to give airtable the filterbyformula
  function formatFiltersForAirtable(filter_list){
    // basic string
    var openstr = "NOT(OR("
    var closestr = "))"

    var str = openstr

    for (var item of filter_list){

      // Any fields that are lists of tags should go in this array to get filtered correctly
      var listFields = ['Geography_Countries','Age_Groups','Outcome_Concepts','Intervention_Types']

      var key = Object.keys(item)[0]
      var val = Object.values(item)[0]
      if (listFields.includes(key)){

        if (filter_list.indexOf(item) !== (filter_list.length-1)) {
          var substr = "FIND('" + val + "', {"+ key + "} & ''), "
          str += substr
        } else {
          var substr = "FIND('" + val + "', {"+ key + "} & '')"
          str += substr
        }
      } else {
        if (filter_list.indexOf(item) !== (filter_list.length-1)) {
          var substr = "{" + key + "} = '" + val + "', "
          str += substr
        } else {
          var substr = "{" + key + "} = '" + val + "'"
          str += substr
        }
      }
    }
    str += closestr
    console.log("FILTER STRING: ", str)

    return str
  }


  // creating a single function to help make creating dynamic filters much simpler
  // TODO: need to put in conditions to handle geography

  function newgetfilters(allTableData){
    var result = {}
    for (var filter_header of Object.keys(all_filters)){
      // a filter header will be the big title i.e. Trials or Geography
      // want to create a dictionary for each of these
      var mainfilters = {}
      // the subfilter will be like Type or Age Group or Status
      for (var subfilter of all_filters[filter_header]) {
        // create a set for the subfilter to get the unique ones

        var unique_subfilters = {}
        var subfilter_set = new Set()
        // now we need to go through the alltabledata and get the values that of the subfilter key

        // if (subfilter === "Geography") {
        //   // create a country list and a region list
        //   // create a set of unique regions
        //   for (var trial_regions of regions_list){
        //     var region_list_index = regions_list.indexOf(trial_regions)
        //     var country_names = countries_list[region_list_index]
        //     if (typeof(trial_regions) === 'object'){
        //       for (var region of trial_regions){
        //         if (Object.keys(unique_regions).indexOf(region)!==-1){
        //               unique_regions[region][country_names[trial_regions.indexOf(region)]] = true;
        //         } else {
        //               unique_regions[region] = {[country_names[trial_regions.indexOf(region)]]: true}
        //         }
        //       }
        //     }
        //   }
        //   var sorted_regions = {}
        //   for (var region of Object.keys(unique_regions)){
        //     var sorted_countries = {}
        //     sortDictionary(unique_regions[region], sorted_countries)
        //     unique_regions[region] = sorted_countries
        //   }
        //   sortDictionary(unique_regions, sorted_regions)
        //   geography_filts["Regions"] = sorted_regions
        // }

        // else {
        //
        // }
        for (var item of allTableData){

          Object.keys(item).forEach(key => {
            if (key === subfilter){
              // now need to check what item[key] is
              //console.log("key is: ", key)
              if (typeof(item[key])==='object'){
                for (var i of item[key]){
                  if (i === null){
                  } else {
                    var itemlist = i.split(", ")
                    for (var j of itemlist){
                      subfilter_set.add(j)
                    }
                  }
                }
              } else if (item[key].includes(", ") && item[key] !== "Active, not recruting"){
                var itemlist = item[key].split(", ")
                for (var j of itemlist){
                  subfilter_set.add(j)
                }
              } else {
                subfilter_set.add(item[key])
              }
            }
          })
        }
        // now when we get here, we will have created the set for one subfilter
        // need to pass this subfilter to the create filter dictionary function
        create_filter_dict([...subfilter_set].sort(), unique_subfilters)
        //console.log("Main filters: ", mainfilters)
        //console.log("subfilter: ", subfilter)
        let index = Object.values(dropdownItems).indexOf(subfilter)
        mainfilters[Object.keys(dropdownItems)[index]] = unique_subfilters
      }
      result[filter_header] = mainfilters
      //console.log("filter HEADERS: ", filter_header)
    }
    //console.log("Filters: ", result)
    return result
  }

////////////////////////////////////////////////////////////////

//  CHART CREATION FUNCTIONS                                 //

///////////////////////////////////////////////////////////////

  // CREATE PIE CHART
  // airtable name is the column name in airtable
  // data should be the whole data set after filtering
  function createPieChart(airtableName, data){
    let pie_obj = {}
    for (var record of data){
      let value = getVal(record, airtableName)
      countOccurrences(pie_obj, value)
    }
    let pie = [];
    pieFormatting(pie_obj, pie);

    return pie
  }

  // CREATE LINE CHART
  // airtable x axis is the column name of whatever you want the xaxis to be, data is the whole data set after filtering
  function createLineChart(airtable_xAxis, data){
    var line_obj = {};
    for (var record of data){
      let value = getVal(record, airtable_xAxis)
      countOccurrences(line_obj, value)
    }
    let line_list = [];
    let line_formatted = {};
    lineFormatting(line_obj, line_list, line_formatted)
    line_formatted.id = 0
    //console.log('LINE FORMATTED: ', line_formatted)

    return [line_formatted]
  }

  // CREATE BAR CHART
  // airtable name is the column name in airtable of the data you want the pie chart to show
  // numBars is the number of bars you want (i.e. 10 will give you top 10 bars)
  // indexkey is a nivo specific item - doesn't matter what you make this as long as it matches the value for indexKey in the html
  function createBarChart(airtableName, numBars, indexKey, data){
    let bar_obj = {};
    for (var record of data){
      let value = getVal(record, airtableName)
      // in case of list of items
      if (typeof(value)==='object'){
        for (var item of value){
          if (item !== null){
            var itemlist = item.split(", ")
            for (var j of itemlist){
              countOccurrences(bar_obj, j)
            }
          }
        }
      } else {
          if (airtableName === "Intervention_Types"){
            var itemlist = value.split(", ")
          } else {
            var itemlist = value.split(",")
          }
          for (var j of itemlist){
            countOccurrences(bar_obj, j)
          }
      }
    }

    var keys = Object.keys(bar_obj).map(function(key){
      //console.log("KEY: ", key)
      return [key, bar_obj[key]];
    });
    keys.sort(function(first, second){
      return second[1] - first[1];
    })
    let updated_bars = {};
    for (var i of keys.slice(0, numBars)){
      //console.log("i: ", i)
      updated_bars[i[0]] = i[1]
    }
    let bar_formatted = {};
    //console.log("updated BArs: ", updated_bars)
    barFormatting(updated_bars, [], bar_formatted, indexKey)
    console.log("bar FORMAtTED: ", bar_formatted)
    return bar_formatted
  }


  // CREATE SUNBURST CHART
  // level1 is the data you want at the inner level, level2 at middle and level3 at outer
  // each level name should match the name of an airtable column
  function createSunburst(level1, level2, level3, data) {
    if (typeof(data[0][level1]) === 'object'){
      var rollupdata = d3.rollup(data, g => g.length, d => d[level1][0], d => d[level2], d => d[level3])
    } else {
      var rollupdata = d3.rollup(data, g => g.length, d => d[level1], d => d[level2], d => d[level3])
    }

    console.log("Rollup: ", rollupdata)
    // now take this and reformat it for as arrays rather than maps
    let wholedata = []

    for (var key of rollupdata.keys()){

      let name0 = key
      let children0 = []
      for (var element1 of rollupdata.get(key)){
          let name1 = element1[0]
          let children1 = []
          let middle = {}
          for (var element2 of element1[1].keys()){
            let map = element1[1]
            let name2 = element2
            let value = map.get(element2)
            let outer = {}
            outer["name"] = name2
            outer["value"] = value
            children1.push(outer)
          }
          middle["name"] = name1
          middle["children"] = children1
          children0.push(middle)
      }
      var inner = {}
      inner["name"] = name0
      inner["children"] = children0
      wholedata.push(inner)
    }
    let sunburst_data = {}
    sunburst_data["name"] = "data"
    sunburst_data["children"] = wholedata
    console.log("SUNBURST DATA: ", sunburst_data)
    return sunburst_data
  }

  // CREATE CHLOROPETH CHART
  // airtable name is the column you want to use for countries and data is the whole data set after filtering
  function createChloropeth(airtableName, data){
      const cc = require('@genyus/country-code');
      let geography_result = []
      let geography_country_dict = {}
      for (let record of data){
        let country = record[airtableName]
        //console.log("COUNTRY: ", country)
        if (typeof(country)!=='object'){
          for (let item of country.split(",")){
            if (item === "Czechia") {
              countOccurrences(geography_country_dict, "CZE")
            } else if (item === ""){

            } else {
              var code = cc.nameIncludes(item)[0].alpha3
              countOccurrences(geography_country_dict, code)
            }
          }
        }
      } // end for record loop
      //console.log("Geog dict: ", geography_country_dict)
      geogFormatting(geography_country_dict, geography_result)
      //console.log("Geography REsult: ", geography_result)
      return geography_result
    }







  // Filters
  const [sidebarIsVisible, setSidebarIsVisible] = useState(false)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("")
  const [activeParentFilter, setActiveParentFilter] = useState("")
  const [activeParentFilterSections, setActiveParentFilterSections] = useState({})
  const [hoveredParentFilter, setHoveredParentFilter] = useState("")
  const [activeChildFilterSections, setActiveChildFilterSections] = useState({})

  // stats original variables
  const [stats, setStats] = useState(initialStats)

  // trials charts original vars
  const [trialStatusPieChartData, setTrialStatusPieChartData] = useState([])
  const [trialPurposePieChartData, setTrialPurposePieChartData] = useState([])
  const [trialRandomizationPieChartData, setTrialRandomizationPieChartData] = useState([])
  const [trialMaskingPieChartData, setTrialMaskingPieChartData] = useState([])
  const [trialTypePieChartData, setTrialTypePieChartData] = useState([])
  const [cumulativeTrialsLineChartData, setCumulativeTrialsLineChartData] = useState([])
  const [singleMultiSitePieChartData, setSingleMultiSitePieChartData] = useState([])
  const [trialAgeGroupsPieChartData, setTrialAgeGroupsPieChartData] = useState([])

  // populations charts original variables
  const [populationVolunteersPieChartData, setPopulationVolunteersPieChartData] = useState([])
  const [populationEnrollmentPieChartData, setPopulationEnrollmentPieChartData] = useState([])

  // outcomes charts original varible
  const [outcomesTop10ParentBarChartData, setOutcomesTop10ParentBarChartData] = useState({data: [], group_keys: []})

  // intervention charts original variables
  const [interventionsTop10BarChartData, setInterventionsTop10BarChartData] = useState({data: [], group_keys: []})

  // sponsors charts original variables
  const [sponsorsTop10ByTrialsBarChartData, setSponsorsTop10ByTrialsBarChartData] = useState({data: [], group_keys: []})
  const [sponsorsTop10ByEnrollmentBarChartData, setSponsorsTop10ByEnrollmentBarChartData] = useState({data: [], group_keys: []})
  const [sponsorsBreakdownChartData, setSponsorsBreakdownChartData] = useState([])

  // geography charts original variables
  const [geographyFacilitiesChartData, setGeographyFacilitiesChartData] = useState([])



  const [landscapeChartData, setLandscapeChartData] = useState([])
  const [landscapeChartHeight, setLandscapeChartHeight] = useState(100)

  const [landscapeMinNodeSize, setLandscapeMinNodeSize] = useState(0)
  const [landscapeMaxNodeSize, setLandscapeMaxNodeSize] = useState(1)
  const [landscapeXAxis, setLandscapeXAxis] = useState("Start_Year")
  const [landscapeYAxis, setLandscapeYAxis] = useState("Age_Groups")
  const [landscapeZAxis, setLandscapeZAxis] = useState("Enrollment")

  const [landscapeVisXAxis, setLandscapeVisXAxis] = useState("Start Year")
  const [landscapeVisYAxis, setLandscapeVisYAxis] = useState("Settings")
  const [landscapeVisZAxis, setLandscapeVisZAxis] = useState("Enrollment")

  const [allTableData, setAllTableData] = useState([])
  const [loadingAllTableData, setLoadingAllTableData] = useState(true)

  const [sponsorsSunburstChart, setSponsorsSunburstChart] = useState({})
  const [loadingSponsorsSunburstChart, setLoadingSponsorsSunburstChart] = useState(true)
  const [trialsSunburstChart, setTrialsSunburstChart] = useState({})
  const [loadingTrialsSunburstChart, setLoadingTrialsSunburstChart] = useState(true)


  // loading variables - set the loading icons until the data has fully loaded
  const [loadingStatsData, setLoadingStatsData] = useState(true)
  const [loadingTrialsData, setLoadingTrialsData] = useState(true)
  const [loadingPopulationData, setLoadingPopulationData] = useState(true)
  const [loadingInterventionsData, setLoadingInterventionsData] = useState(true)
  const [loadingOutcomesData, setLoadingOutcomesData] = useState(true)
  const [loadingSponsorsData, setLoadingSponsorsData] = useState(true)
  const [loadingGeographyData, setLoadingGeographyData] = useState(true)
  const [loadingLandscapeData, setLoadingLandscapeData] = useState(true)







  // Single Metrics Vars
  // var single_metrics_result = {}
  // var single_metric_trials = []
  // var single_metric_participants = []
  // var single_metric_sponsors = new Set()
  // var single_metric_outcomes = new Set()
  // var single_metric_interventions = 0
  // var single_metric_sites = new Set()




  // this is now the only function that pulls in data from airtable
  // it returns a dictionary with keys "tabledata" (properly formatted for the tabulator table)
  // and "alldata", the data used to pass to the createChart functions
  function getTableData(){

        var tab_ind = 0
        var table_data = []
        var alldata = []

        return new Promise((resolve, reject) => {
          base('Trials').select({

              filterByFormula: airtableFilters,
              view: "Raw View"
          }).eachPage(function page(records, fetchNextPage) {

              records.forEach(function(record) {
                record.fields["id"] = tab_ind
                tab_ind = tab_ind + 1;
                table_data.push(record.fields)
                alldata.push(record.fields)

              });
              fetchNextPage();
          }, function done(err) {
              if (err) {
                console.error(err);
                return reject({});
              }

              console.log("ALL data: ", alldata)
              // console.log("CHECK: ", typeof(alldata[4]["Arms_Raw"]))
              var tabledata = {}
              tabledata["tabledata"] = table_data
              tabledata["alldata"] = alldata
              resolve(tabledata)
          })
        })
    }



    const fetchAllTableData = async () => {
      const res = await getTableData()
      let filters = newgetfilters(res.alldata)
      let alldata = res.alldata


      // SET FILTERS
      setTrialsFilters(filters.Trials)
      setInterventionsFilters(filters.Interventions)
      setOutcomesFilters(filters.Outcomes)
      setSponsorsFilters(filters.Sponsors)
      setPopulationFilters(filters.Populations)
      setGeographyFilters(filters.Geography)
      setInitialFilterLoadComplete(true)

      // Converting table data to strings; otherwise the format is weird when you download the table
      for (var record of res.tabledata){
        for (var key of Object.keys(record)){
          if (typeof(record[key] !== "String")){
            record[key] = record[key].toString()
          }
        }
      }
      // SET TABLE DATA
      setAllTableData(res.tabledata)
      setLoadingAllTableData(false)

      // SET SUNBURST CHARTS
      setSponsorsSunburstChart(createSunburst("Sponsor_Type", "Status", "Sponsor", alldata))
      setLoadingSponsorsSunburstChart(false)
      setTrialsSunburstChart(createSunburst("Purpose", "Intervention_Types", "Status", alldata))
      setLoadingTrialsSunburstChart(false)

      setTrialStatusPieChartData(createPieChart("Status", alldata));
      setTrialPurposePieChartData(createPieChart("Purpose", alldata));

      setTrialTypePieChartData(createPieChart("Study_Type", alldata));
      setTrialAgeGroupsPieChartData(createPieChart("Age_Groups", alldata));
      setCumulativeTrialsLineChartData(createLineChart("Start_Year", alldata));
      setTrialRandomizationPieChartData(createPieChart("Randomization", alldata));
      setTrialMaskingPieChartData(createPieChart("Masking_Clean", alldata));

      setLoadingTrialsData(false)

      setSingleMultiSitePieChartData(createPieChart("Single_Multi_Site", alldata));
      setPopulationVolunteersPieChartData(createPieChart("Enrollment_Target", alldata));
      setPopulationEnrollmentPieChartData(createPieChart("Healthy_Volunteers", alldata))
      setLoadingPopulationData(false)

      setOutcomesTop10ParentBarChartData(createBarChart("Outcome_Concepts", 10, "outcome", alldata));
      setLoadingOutcomesData(false)

      setInterventionsTop10BarChartData(createBarChart("Intervention_Types", 10, "intervention", alldata));
      setLoadingInterventionsData(false)

      setSponsorsTop10ByTrialsBarChartData(createBarChart("Sponsor_Type", 10, "sponsor", alldata));
      setLoadingSponsorsData(false)

      setGeographyFacilitiesChartData(createChloropeth("Countries_Rollup_Unique", alldata));
      setLoadingGeographyData(false)

      // SET SINGLE STATS
      setStats([
        {
          color: 'red',
          stats: [
            { title: 'Trials', metric: singleStatTotalsCount("Trials", alldata) }
          ]
        },
        {
          color: 'orange',
          stats: [
            { title: 'Participants', metric: singleStatTotalsCount("Enrollment", alldata)}
          ]
        },
        {
          color: 'yellow',
          stats: [
            { title: 'Interventions', metric: singleStatUniquesCount("Interventions_Link", alldata) }
          ]
        },
        {
          color: 'green',
          stats: [
            { title: 'Outcomes', metric: singleStatUniquesCount("Outcome_Concepts", alldata) }
          ]
        },

        {
          color: 'blue',
          stats: [
            { title: 'Sponsors', metric: singleStatUniquesCount('Sponsor', alldata) }
          ]
        },

        {
          color: 'violet',
          stats: [
            { title: 'Sites', metric: singleStatUniquesCount("Facilities_Links", alldata) }
          ]
        },

      ])
      setLoadingStatsData(false)


    }
    useEffect(() => {
      fetchAllTableData();
    }, [])

    // used for updating the filters
    const generateFiltersPostBody = () => {
      return {
        "Trials": trialsFilters,
        "Populations": populationFilters,
        "Interventions": interventionsFilters,
        "Outcomes": outcomesFilters,
        "Sponsors": sponsorsFilters,
        "Geography": geographyFilters,
      }
    }


    // need to convert this one

//   // GET SINGLE METRICS  from airtable
//   function getSingleMetrics() {
//
//     return new Promise((resolve, reject) => {
//       base('Trials').select({
//           // Selecting the first 3 records in Raw View:
//           filterByFormula: airtableFilters,
//           view: "Raw View"
//       }).eachPage(function page(records, fetchNextPage) {
//           // This function (`page`) will get called for each page of records.
//
//
//           records.forEach(function(record) {
//
//             single_metric_trials.push(1)
//             var enrollment_type = typeof(record.get('Enrollment'))
//             if (enrollment_type === 'number') {
//               single_metric_participants.push(record.get('Enrollment'))
//             }
//             single_metric_sponsors.add(record.get('Sponsor'))
//
//             // trials, just push (1)
//             // enrollment, check if number
//             // get single metrics uniques and get single metrics totals
//             // uniques would be sponsors, outcomes Facilities_Links
//             // totals would be trials, participants, interventions
//
//             // intervention_set
//
//             var intervention = record.get('Interventions_Rollup')
//             single_metric_interventions += intervention.length
//
//             // outcomes
//             var outcome = record.get('Outcome_Concepts')
//             if (typeof(outcome)==='object'){
//               for (var item of outcome){
//                 if (item === null){
//                   single_metric_outcomes.add(null)
//                 } else {
//                   var itemlist = item.split(", ")
//                   for (var j of itemlist){
//                     single_metric_outcomes.add(j)
//                   }
//                 }
//               }
//             } else {
//               single_metric_outcomes.add(outcome)
//             }
//
//             // sites
//             var facility_ids = record.get('Facilities_Links')
//             if (typeof(facility_ids)==='object'){
//               for (var item of facility_ids){
//                 if (item === null){
//                   single_metric_sites.add(null)
//                 } else {
//                   var itemlist = item.split(", ")
//                   for (var j of itemlist){
//                     single_metric_sites.add(j)
//                   }
//                 }
//               }
//             } else {
//               single_metric_sites.add(facility_ids)
//             }
//
//           });
//
//           fetchNextPage();
//
//       }, function done(err) {
//           if (err) {
//             console.error(err);
//             return reject({});
//           }
//
//
//           single_metrics_result["trials"] = sum(single_metric_trials);
//           single_metrics_result["participants"] = sum(single_metric_participants);
//           single_metrics_result["interventions"] = single_metric_interventions;
//           single_metrics_result["outcomes"] = single_metric_outcomes.size;
//           single_metrics_result["sponsors"] = single_metric_sponsors.size;
//           single_metrics_result["sites"] = single_metric_sites.size;
//
//           resolve(single_metrics_result)
//
//       })
//     })
// }
  // get single site metrics
  /*
  There are two types of single stat metrics; counts of totals and counts of unqiues
  ex. trials and participants count total # of trials and total enrollment
  this is compared to outcomes, which is only counting the unique outcomes
  */
  function singleStatUniquesCount(airtableName, data){
    let countSet = new Set()
    //console.log("AIRTABlE NAME IS: ", airtableName)
    for (let record of data){
      let value = getVal(record, airtableName)
      if (typeof(value) === "string"){
        var itemlist = value.split(",")
        for (var j of itemlist){
          if (j === "" || j.slice(0, 1) === " ") {

          } else {
            countSet.add(j)
          }
        }
      }
    }
    console.log("Count set is: ", airtableName, countSet)
    return countSet.size
  }


  function singleStatTotalsCount(airtableName, data){
    // trials counts
    if (airtableName === "Trials"){
      return data.length
    } else {
      // general if you wanted a total count
      let numList = []
      let strList = []
      let doSum = true
      for (let record of data){
        let value = record[airtableName]
        if (typeof(value) === "string"){
          if (isNaN(parseInt(value))){
            let all = value.split(",")
            // console.log("ALL: ", all)
            // strList.push(value)
            for (let item of all){
              if (item !== ""){
                console.log("ITEM; ", item)
                strList.push(item)
              }
            }
            doSum = false

          } else {
            numList.push(parseInt(value))
            doSum = true
          }
        } else {
          console.log("Run a check: ", value, typeof(value))
        }
      }
      console.log("Stir list: ", strList)
      return doSum ? sum(numList) : strList.length
    }

  }


//*************************************************************************
// change this so that it takes arguments

  // const fetchSingleStatMetrics = async () => {
  //
  //   const result = await getSingleMetrics()
  //   //console.log("result for single metric: ", result)
  //   setStats([
  //     {
  //       color: 'red',
  //       stats: [
  //         { title: 'Trials', metric: result.trials}
  //       ]
  //     },
  //     {
  //       color: 'orange',
  //       stats: [
  //         { title: 'Participants', metric: result.participants}
  //       ]
  //     },
  //     {
  //       color: 'yellow',
  //       stats: [
  //         { title: 'Interventions', metric: result.interventions}
  //       ]
  //     },
  //     {
  //       color: 'green',
  //       stats: [
  //         { title: 'Outcomes', metric: result.outcomes}
  //       ]
  //     },
  //
  //     {
  //       color: 'blue',
  //       stats: [
  //         { title: 'Sponsors', metric: result.sponsors}
  //       ]
  //     },
  //
  //     {
  //       color: 'violet',
  //       stats: [
  //         { title: 'Sites', metric: result.sites}
  //       ]
  //     },
  //
  //   ])
  //   setLoadingStatsData(false)
  //
  //
  // }




  // need to convert this one
// Landscapes ************************************************
  function getLandscapeChartData() {
    // data list
    let data_list = []
    let uni = new Set()
    let ys = new Set()

    return new Promise((resolve, reject) => {
      base('Trials').select({

          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {


          records.forEach(function(record) {
            //statuses.add(record.get('Status'))
            // get all status
            let status = record.get('Status')
            let allx = String(record.get(landscapeXAxis))
            let ally = String(record.get([landscapeYAxis]))
            let z = record.get(landscapeZAxis)
            if (landscapeZAxis === "Trial Volume") {
              z = 1
            }

            let y_list = []
            if ( landscapeYAxis === "Intervention_Types"){
              y_list = ally.split(", ")
            } else {
              y_list = ally.split(",")
            }
            let x_list = []
            if ( landscapeXAxis === "Intervention_Types"){
              x_list = allx.split(", ")
            } else {
              x_list = allx.split(",")
            }



            // need to do each y with each x
            for (var y of y_list){
              if (y !== ""){
                for (var x of x_list){
                  if (x !== "") {
                    data_list.push([status, x, y, z])
                    let as_string = status + "; " + x + "; " + y
                    uni.add(as_string)
                  }
                }
                ys.add(y)
              }
            }
          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }
          let new_data_list = []
          let clean_data = {}
          let zs = []
          //console.log("Ys: ", ys)
          for (var i of uni){

            var ids = i.split("; ")
            let z = 0;
            for (var arr of data_list){
              if (ids[0] === arr[0] && ids[1]===arr[1] && ids[2]===arr[2]){
                z += arr[3]
              }
            }
            let item = {}
            item[ids[0]] = {"x": ids[1], "y": ids[2], "z": z}

            new_data_list.push(item)
          }


          //console.log("data list: ", data_list)
          //console.log("new data: ", new_data_list)
          //console.log('yS; ', ys)

          for (var j of new_data_list){
            let stat = Object.keys(j)[0]
            let val = Object.values(j)

            if (isNaN(val[0]["z"])){
              val[0]["z"] = 0
            }
            zs.push(val[0]["z"])
            // console.log("val: ", val[0]["z"])
            if (stat in clean_data){
              clean_data[stat].push(val[0])
            } else {
              clean_data[stat] = val
            }
          }
          //console.log("zs: ", zs)

          //console.log("clean data: ", clean_data)
          var all_data=[]
          for (var item of Object.keys(clean_data)){
            var cleaned = {}
            cleaned["id"] = item
            cleaned["data"] = clean_data[item]
            all_data.push(cleaned)
          }
          setLandscapeChartHeight(ys.size * 50 + 300)
          var landscape_result={}
          landscape_result["data"] = all_data
          landscape_result["max"] = Math.max(...zs)
          landscape_result["min"] = Math.min(...zs)
          resolve(landscape_result)

        })
      })
  }// end of get trialStatusPieChartData


// need to convert this one
// convert this to add the landscape chart
  const fetchLandscapeChartData = async () => {

    const result = await getLandscapeChartData()
    console.log("LANDSCAPE result: ", result)

    setLandscapeChartData(result.data);
    // setLandscapeChartHeight(result.data.length * 100)
    setLandscapeMinNodeSize(result.min);
    setLandscapeMaxNodeSize(result.max);
    setLoadingLandscapeData(false)
  }





  useEffect(() => {

    if (initialFilterLoadComplete) {


      // fetchSingleStatMetrics();



      setLoadingAllTableData(true)
      setLoadingSponsorsSunburstChart(true)
      setLoadingTrialsSunburstChart(true)
      setLoadingTrialsData(true)
      setLoadingPopulationData(true)
      setLoadingOutcomesData(true)
      setLoadingInterventionsData(true)
      setLoadingSponsorsData(true)
      setLoadingGeographyData(true)
      setLoadingStatsData(true)
      fetchAllTableData();
      // fetchGeographyData();
    }
    // eslint-disable-next-line
  }, [updateRequested, initialFilterLoadComplete])

  useEffect(() => {
  if (initialFilterLoadComplete) {
    setLoadingLandscapeData(true)
    fetchLandscapeChartData();
  }
  // eslint-disable-next-line
}, [updateRequested, initialFilterLoadComplete, landscapeXAxis, landscapeYAxis, landscapeZAxis, landscapeMinNodeSize, landscapeMaxNodeSize, landscapeVisXAxis, landscapeVisYAxis, landscapeVisZAxis])


  if (currentUser === undefined) {
    return <Redirect to="/login" />
  }

  const setLandscapeAxis = (axis, value) => {
    //console.log("landscape axis: ", axis, value)
    //console.log("checking this: ", dropdownItems[value])
    switch (axis) {
      case "x":
        setLandscapeXAxis(dropdownItems[value])
        setLandscapeVisXAxis(value)
        break;
      case "y":
        setLandscapeYAxis(dropdownItems[value])
        setLandscapeVisYAxis(value)
        break;
      case "z":
        setLandscapeZAxis(value)
        //setLandscapeVisZAxis(dropdownItems[value])
        break;
      default:
        break;
    }
  }

  // closes the sidebar when you click away
  const closeSidebar = () => {
    setSidebarIsVisible(false)
    setActiveCategoryFilter("")
    setActiveParentFilterSections({})
  }

  const onFilterUnHover = (filter) => {
    setHoveredParentFilter(null)
    if (!activeParentFilter) {
      setActiveChildFilterSections({})
    }
  }

  const onNavItemClicked = (e, title) => {
    e.preventDefault()
    console.log("Title in nav item clicked: ", title)
    console.log("active category filter: ", activeCategoryFilter)
    if (title === activeCategoryFilter) {
      setSidebarIsVisible(false)
      setActiveCategoryFilter("")
      setActiveParentFilterSections({})
      setActiveParentFilter("")
    }
    else {
      setSidebarIsVisible(true)
      setActiveCategoryFilter(title)
      setActiveParentFilter("")
      switch (title) {
        case 'Trials':
          setActiveParentFilterSections(trialsFilters)
          break;
        case 'Populations':
          setActiveParentFilterSections(populationFilters)
          break;
        case 'Interventions':
          setActiveParentFilterSections(interventionsFilters)
          break;
        case 'Outcomes':
          setActiveParentFilterSections(outcomesFilters)
          break;
        case 'Sponsors':
          setActiveParentFilterSections(sponsorsFilters)
          break;
        case 'Geography':
          setActiveParentFilterSections(geographyFilters)
          break;
        default:
          setActiveParentFilterSections({})
      }
    }
  }

  const updateFilters = (filters, section, filter) => {
    return ({
      ...filters,
      [section]: {
        ...filters[section],
        [filter]: !filters[section][filter]
      }
    })
  }

  const updateChildFilters = (filters, section, filter) => {
    return ({
      ...filters,
      Children: {
        ...updateFilters(filters.Children, section, filter)
      }
    })
  }

  const onParentFilterClicked = (section, filter, shouldSelect=true) => {
    //console.log("first filter: ", filter)
    //console.log("first section: ", section)
    if (filter) {
      switch (activeCategoryFilter) {
        case 'Trials':
          setTrialsFilters(filters => updateFilters(filters, section, filter))
          setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
          if ((filter || trialsFilters[section][filter] === false) && shouldSelect === true){
            setActiveParentFilter(filter)
            setActiveChildFilterSections({})
          }
          break;
        case 'Populations':
            setPopulationFilters(filters => updateFilters(filters, section, filter))
            setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
            if ((filter || populationFilters[section][filter] === false) && shouldSelect === true){
              setActiveParentFilter(filter)
              setActiveChildFilterSections({})
            }
            break;
        case 'Interventions':
                setInterventionsFilters(filters => updateFilters(filters, section, filter))
                setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
                if ((filter || interventionsFilters[section][filter] === false) && shouldSelect === true){
                  setActiveParentFilter(filter)
                  setActiveChildFilterSections({})
                }
            break;
        case 'Outcomes':
            setOutcomesFilters(filters => updateFilters(filters, section, filter))
            setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
            if ((filter || outcomesFilters[section][filter] === false) && shouldSelect === true){
              setActiveParentFilter(filter)
              setActiveChildFilterSections({})
            }
            break;
        case 'Sponsors':
          setSponsorsFilters(filters => updateFilters(filters, section, filter))
          setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
          if ((filter || sponsorsFilters[section][filter] === false) && shouldSelect === true){
            setActiveParentFilter(filter)
            setActiveChildFilterSections({})
          }
          break;
        case 'Geography':
          setGeographyFilters(filters => updateFilters(filters, section, filter))
          setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
          if ((filter || geographyFilters[section][filter] === false) && shouldSelect === true){
            setActiveParentFilter(filter)
            setActiveChildFilterSections({})
          }
          break;
        default:
          setActiveParentFilterSections({})
      }
    }
  }

  const onParentFilterLabelClicked = (section, filter) => {
    if (!filter || activeParentFilter === filter){
      setActiveParentFilter(null)
      setActiveChildFilterSections({})
    } else {
      setActiveParentFilter(filter)

    }
  }



  const showDoubleSideBar = (activeParentFilter || hoveredParentFilter) && [].includes(activeCategoryFilter)

  const colors = {
    'Trials': 'red',
    'Populations': 'orange',
    'Interventions': 'yellow',
    'Outcomes': 'green',
    'Sponsors': 'blue',
    'Geography': 'violet',
  }



  return (
    <div>
      <Navbar
        onNavItemClicked={onNavItemClicked}
        activeTab={activeCategoryFilter}
        onUpdateButtonClicked={onUpdateButtonClicked}
      />
      <Container fluid className='dashboard-route'>
        <div className="full-width">
          <Row className="no-gutters">
            <Col className="searchbar-container">
              <Searchbar />
            </Col>
          </Row>

          <div className="scrollable-container">
              <Row className="d-none d-xl-block" style={{ paddingTop: '80px'}}>
                <Col xl={{span: 12}}>
                  <div className="single-stats-containers">
                    {
                      stats.map((stat, index) => {
                        return (
                          <SingleStat
                            key={index}
                            stats={stat.stats}
                            color={stat.color}
                            loading={loadingStatsData}
                          />
                        )
                      })
                    }
                  </div>
                </Col>
              </Row>
              <Row className="d-xl-none" style={{ paddingTop: '80px'}}>
                <Col lg={{span: 12}}>
                  <div className="single-stats-containers">
                    {
                      stats.map((stat, index) => {
                        if (index >= (stats.length / 2))
                          return null

                        return (
                          <SingleStat
                            key={index}
                            stats={stat.stats}
                            color={stat.color}
                            loading={loadingStatsData}
                          />
                        )
                      })
                    }
                  </div>
                </Col>
                <Col lg={{span: 12}}>
                  <div className="single-stats-containers">
                    {
                      stats.map((stat, index) => {
                        if (index < (stats.length / 2))
                          return null

                        return (
                          <SingleStat
                            key={index}
                            stats={stat.stats}
                            color={stat.color}
                            loading={loadingStatsData}
                          />
                        )
                      })
                    }
                  </div>
                </Col>
              </Row>
              <Row className="dashboard-charts-container">
                <Col>
                  <Row>
                    <Col>
                      <SectionTitle title="Trials" color="red" />
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={{span: 6}}>
                      <PrismPieChart
                        title="Trial Status"
                        colors="rainbow"
                        chartData={trialStatusPieChartData}
                        loading={loadingTrialsData}
                      />
                    </Col>
                    <Col lg={{span: 6}}>
                      <PrismPieChart
                        colors="rainbow"
                        title="Trial Purpose"
                        chartData={trialPurposePieChartData}
                        loading={loadingTrialsData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={{span: 6}}>
                      <PrismPieChart
                        colors="rainbow"
                        title="Randomization"
                        chartData={trialRandomizationPieChartData}
                        loading={loadingTrialsData}
                      />
                    </Col>
                    <Col lg={{span: 6}}>
                      <PrismPieChart
                        colors="rainbow"
                        title="Masking"
                        chartData={trialMaskingPieChartData}
                        loading={loadingTrialsData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <PrismLineChart
                        colors="rainbow"
                        title="Trials Per Year"
                        chartData={cumulativeTrialsLineChartData}
                        xAxisLabel="Year"
                        yAxisLabel="Trials"
                        showLegend={false}
                        tooltip={false}
                        loading={loadingTrialsData}
                      />
                    </Col>
                  </Row>


                  <Row>
                  <Col>
                    <PrismScatterplot
                      title="Landscape"
                      colors="rainbow"
                      chartData={landscapeChartData}
                      chartHeight={landscapeChartHeight}
                      minNodeSize={landscapeMinNodeSize}
                      maxNodeSize={landscapeMaxNodeSize}
                      xAxisLabel={landscapeVisXAxis}
                      yAxisLabel={landscapeVisYAxis}
                      zAxisLabel={landscapeZAxis}
                      setLandscapeAxis={setLandscapeAxis}
                      loading={loadingLandscapeData}
                    />
                  </Col>
                  </Row>

                  <Row>
                    <Col>
                      <PrismSunburst
                        colors="rainbow"
                        title="Trials Breakdown"
                        chartData={trialsSunburstChart}
                        loading={loadingTrialsSunburstChart}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <SectionTitle title="Populations" color="orange" />
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={{span: 6}}>
                      <PrismPieChart
                        colors="orange"
                        title="Age Groups"
                        chartData={trialAgeGroupsPieChartData}
                        loading={loadingPopulationData}
                      />
                    </Col>
                    <Col lg={{span: 6}}>
                      <PrismPieChart
                        colors="orange"
                        title="Site Types"
                        chartData={singleMultiSitePieChartData}
                        loading={loadingPopulationData}
                      />
                    </Col>
                  </Row>
                  <Row>
                  <Col lg={{span: 6}}>
                    <PrismPieChart
                      colors="orange"
                      title="Healthy Volunteers"
                      chartData={populationVolunteersPieChartData}
                      loading={loadingPopulationData}
                    />
                  </Col>
                  <Col lg={{span: 6}}>
                    <PrismPieChart
                      colors="orange"
                      title="Target Enrollment"
                      chartData={populationEnrollmentPieChartData}
                      loading={loadingPopulationData}
                    />
                  </Col>
                  </Row>
                  <Row>
                    <Col>
                      <SectionTitle title="Interventions" color="yellow" />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <PrismBarChart
                        color="yellow"
                        layout="horizontal"
                        title="Intervention Types"
                        chartData={interventionsTop10BarChartData.data}
                        groupKeys={interventionsTop10BarChartData.group_keys}
                        indexKey="intervention"
                        xAxisLabel=""
                        yAxisLabel=""
                        loading={loadingInterventionsData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <SectionTitle title="Outcomes" color="green" />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <PrismBarChart
                        color="green"
                        layout="horizontal"
                        title="Top 10 Outcomes"
                        chartData={outcomesTop10ParentBarChartData.data}
                        groupKeys={outcomesTop10ParentBarChartData.group_keys}
                        indexKey="outcome"
                        xAxisLabel=""
                        yAxisLabel=""
                        loading={loadingOutcomesData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <SectionTitle title="Sponsors" color="blue" />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <PrismSunburst
                        colors="rainbow"
                        title="Sponsors Breakdown"
                        chartData={sponsorsSunburstChart}
                        loading={loadingSponsorsSunburstChart}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <PrismBarChart
                        color="blue"
                        layout="horizontal"
                        title="Sponsor Type Breakdown"
                        chartData={sponsorsTop10ByTrialsBarChartData.data}
                        groupKeys={sponsorsTop10ByTrialsBarChartData.group_keys}
                        indexKey="sponsor"
                        yAxisLabel=""
                        xAxisLabel="Trials"
                        showLegend={false}
                        loading={loadingSponsorsData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <SectionTitle title="Geography" color="indigo" />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <PrismChoropleth
                        colors="rainbow"
                        title="Trial Volume By Country"
                        chartData={geographyFacilitiesChartData}
                        loading={loadingGeographyData}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <SectionTitle title="Data" color="blue" />
                    </Col>
                  </Row>

                  <div className="table-container">
                    <MainTable
                      tabledata={allTableData}
                      updateData={allTableData}
                      />
                  </div>
                </Col>
              </Row>
          </div>
        </div>
        { activeCategoryFilter &&
          <SlidingPane
            isOpen={sidebarIsVisible}
            from={'left'}
            hideHeader={true}
            width={showDoubleSideBar ? '750px' : '500px'}
            onRequestClose={() => closeSidebar()}
          >
            <div className={"sliding-pane-container " + colors[activeCategoryFilter]}>
              <div className="left-pane">
                <SearchFilters
                  activeCategory={activeCategoryFilter}
                  activeFilter={activeParentFilter}
                  sections={activeParentFilterSections}
                  onFilterClicked={onParentFilterClicked}
                  onFilterLabelClicked={onParentFilterLabelClicked}
                  onFilterUnHover={onFilterUnHover}
                />
              </div>

            </div>
          </SlidingPane>
        }
      </Container>
    </div>

  )
}



export default withRouter(DashboardRoute);
