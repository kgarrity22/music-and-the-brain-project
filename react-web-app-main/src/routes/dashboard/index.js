import React, { useState, useEffect } from "react";
import { Redirect, withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap'
import axios from 'axios';
import { Auth } from 'aws-amplify';
import * as d3 from 'd3'

import CsvDownloader from 'react-csv-downloader';

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
  // sets filters
  const onUpdateButtonClicked = (e) => {
    //console.log(e)
    setUpdatedRequested(Date())
    closeSidebar()
    console.log("Filters?", generateFiltersPostBody())
    var filters_list = getAirtableFilters()
    var filts_final = formatFiltersForAirtable(filters_list)

    setAirtableFilters(filts_final)


  }


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

              if (sub_section === "Type") {
                var new_dict = {"Study_Type": key}
                store.push(new_dict)
              } else if (sub_section === "Age Groups"){
                var new_dict = {"Age_Groups": key}
                store.push(new_dict)
              } else if (sub_section === "Masking"){
                var new_dict = {"Masking_Clean": key}
                store.push(new_dict)
              } else if (sub_section === "Healthy Volunteers"){
                var new_dict = {"Healthy_Volunteers": key}
                store.push(new_dict)
              } else if (sub_section === "Single/Multi Site"){
                var new_dict = {"Single_Multi_Site": key}
                store.push(new_dict)
              } else if (sub_section === "Target Enrollment"){
                var new_dict = {"Enrollment_Target": key}
                store.push(new_dict)
              } else if (sub_section === "Settings"){
                var new_dict = {"Facility_Settings": key}
                store.push(new_dict)
              } else if (sub_section === "Interventions"){
                var new_dict = {"Intervention_Types": key}
                store.push(new_dict)
              } else if (sub_section === "Outcomes"){
                var new_dict = {"Outcome_Concepts": key}
                store.push(new_dict)
              } else if (sub_section === "Sponsors"){
                var new_dict = {"Sponsor_Type": key}
                store.push(new_dict)
              } else if (section === "Geography"){
                var new_dict = {"Geography_Countries": key}
                store.push(new_dict)
              } else {
                var new_dict = {[sub_section]: key}
                store.push(new_dict)
              }
            }
          }
      }
    }

    console.log("filters that have been stored: ", store)
    return store
  }
//var filters = "NOT(OR({Phase} = 'Phase 1'))"
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



  const [trialsFilters, setTrialsFilters] = useState({})
  const [populationFilters, setPopulationFilters] = useState({})
  const [interventionsFilters, setInterventionsFilters] = useState({})
  const [outcomesFilters, setOutcomesFilters] = useState({})
  const [sponsorsFilters, setSponsorsFilters] = useState({})
  const [geographyFilters, setGeographyFilters] = useState({})
  const [initialFilterLoadComplete, setInitialFilterLoadComplete] = useState(false)


  var Airtable = require('airtable');
  var base = new Airtable({apiKey: 'keygbNFWvzaP9t8xi'}).base('appmh47tLfNhe7i80');
  //TRIALS SETS
  var phases_set = new Set();
  var status_set = new Set();
  var purpose_set = new Set();
  var type_set = new Set();
  var randomization_set = new Set();
  var masking_set = new Set();

  //POPULATIONS SETS
  var ageGroups_set = new Set();
  var healthyVolunteers_set = new Set();
  var singleMultiSite_set = new Set();
  var targEnrollment_set = new Set();
  var settings_set = new Set();


  //INTERVENTIONS SETS
  var intervention_set = new Set();

  // var drugs_set = new Set();
  // var devices_set = new Set();
  // var drugs_set = new Set();
  // var biological_set = new Set();
  // var procedures_set = new Set();
  // var radiation_set = new Set();
  // var behavioral_set = new Set();
  // var genetic_set = new Set();
  // var dietarySupplements_set = new Set();
  // var combProds_set = new Set();
  // var diagnostic_set = new Set();
  // var otherInt_set = new Set();

  // OUTCOMES SETS
  var outcomes_set = new Set();

  //SPONSORS SETS
  var sponsors_set = new Set();

  //GEOGRAPHY SETS
  var regions_set = new Set();
  var regions_list = []
  var countries_list = []

  //TRIALS DICTIONARIES
  var unique_phases = {};
  var unique_status = {};
  var unique_purpose = {};
  var unique_type = {};
  var unique_random = {};
  var unique_masking = {};

  //POPULATIONS DICTIONARIES
  var unique_ageGroups = {};
  var unique_healthyVolunteers = {};
  var unique_singleMultiSite = {};
  var unique_targEnrollment = {};
  var unique_settings = {};

  //INTERVENTIONS DICTIONARIES
  var unique_interventions = {};

  // OUTCOMES DICTIONARIES
  var unique_outcomes = {};

  // SPONSORS DICTIONARIES
  var unique_sponsors = {};


  // GEOGRAPHY DICTIONARIES
  var unique_regions = {};


  var trials_filts = {};
  var populations_filts = {};
  var interventions_filts = {};
  var outcome_filts = {};
  var sponsor_filts = {};
  var geography_filts = {}

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



  function create_filter_dict(set, unique_dict){
    for (var i of set) {

        i = String(i)
        unique_dict[i] = true;

    }
  }



  function getairtable() {

    return new Promise((resolve, reject) => {
      base('Trials').select({
          // Selecting the first 3 records in Raw View:
          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.


          records.forEach(function(record) {
            // TRIALS FILTERS
            phases_set.add(record.get('Phase'))
            status_set.add(record.get('Status'))
            purpose_set.add(record.get('Purpose'))
            type_set.add(record.get('Study_Type'))
            randomization_set.add(record.get('Randomization'))
            masking_set.add(record.get('Masking_Clean'))
            // console.log("hERE!")

            // POPULATIONS FILTERS

            var age = record.get('Age_Groups')[0].split(", ")
            for (var item of age){
              //console.log("item: ", item)
              ageGroups_set.add(item)
            }
            healthyVolunteers_set.add(record.get('Healthy_Volunteers'))
            singleMultiSite_set.add(record.get('Single_Multi_Site'))
            targEnrollment_set.add(record.get('Enrollment_Target'))

            var settings = record.get('Facility_Settings')
            //console.log("settings: ", settings)
            if (typeof(settings)==='object'){
              for (var item of settings){
                //console.log("item: ", item)
                settings_set.add(item)
              }
            } else {
              settings_set.add(settings)
            }


            // INTERVENTIONS FILTERS

            var interventions = record.get('Intervention_Types').split(", ")
            for (var item of interventions){
              intervention_set.add(item)
            }



            // OUTCOMES FILTERS

            var outcome = record.get('Outcome_Concepts')
            if (typeof(outcome)==='object'){
              for (var item of outcome){
                if (item === null){
                  // console.log("null")
                } else {
                  var itemlist = item.split(", ")
                  for (var j of itemlist){
                    outcomes_set.add(j)
                  }
                }
              }
            } else {
              outcomes_set.add(outcome)
            }



            // SPONSORS FILTERS
            sponsors_set.add(record.get('Sponsor_Type'))


            // GEOGRAPHY FILTERs
            regions_set.add(record.get('Geography_Regions'))
            regions_list.push(record.get('Geography_Regions'))
            countries_list.push(record.get('Geography_Countries'))


          });

          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }


          // TRIALS
          create_filter_dict([...phases_set].sort(), unique_phases)
          create_filter_dict([...status_set].sort(), unique_status)
          create_filter_dict([...purpose_set].sort(), unique_purpose)
          create_filter_dict([...type_set].sort(), unique_type)
          create_filter_dict([...randomization_set].sort(), unique_random)
          create_filter_dict([...masking_set].sort(), unique_masking)


          trials_filts["Type"] = unique_type;
          trials_filts["Status"] = unique_status;
          trials_filts["Purpose"] = unique_purpose;
          trials_filts["Randomization"] = unique_random;
          trials_filts["Masking"] = unique_masking;
          trials_filts["Phase"] = unique_phases;

          // POPULATIONS
          create_filter_dict([...ageGroups_set].sort(), unique_ageGroups)
          create_filter_dict([...healthyVolunteers_set].sort(), unique_healthyVolunteers)
          create_filter_dict([...singleMultiSite_set].sort(), unique_singleMultiSite)
          create_filter_dict([...targEnrollment_set].sort(), unique_targEnrollment)
          create_filter_dict([...settings_set].sort(), unique_settings)


          populations_filts["Age Groups"] = unique_ageGroups;
          populations_filts["Healthy Volunteers"] = unique_healthyVolunteers;
          populations_filts["Single/Multi Site"] = unique_singleMultiSite;
          populations_filts["Target Enrollment"] = unique_targEnrollment;
          populations_filts["Settings"] = unique_settings;


          // INTERVENTIONS
          create_filter_dict([...intervention_set].sort(), unique_interventions)
          interventions_filts["Interventions"] = unique_interventions


          // OUTCOMES
          create_filter_dict([...outcomes_set].sort(), unique_outcomes)
          outcome_filts["Outcomes"] = unique_outcomes


          // SPONSORS

          create_filter_dict([...sponsors_set].sort(), unique_sponsors)
          sponsor_filts["Sponsors"] = unique_sponsors


          // GEOGRAPHY

          for (var trial_regions of regions_list){
            var region_list_index = regions_list.indexOf(trial_regions)
            var country_names = countries_list[region_list_index]

            if (typeof(trial_regions) === 'object'){

              for (var region of trial_regions){

                if (Object.keys(unique_regions).indexOf(region)!==-1){

                      unique_regions[region][country_names[trial_regions.indexOf(region)]] = true;

                } else {

                      unique_regions[region] = {[country_names[trial_regions.indexOf(region)]]: true}
                }
              }
            }
          }
          var sorted_regions = {}

          for (var region of Object.keys(unique_regions)){
            var sorted_countries = {}
            sortDictionary(unique_regions[region], sorted_countries)
            unique_regions[region] = sorted_countries
          }
          sortDictionary(unique_regions, sorted_regions)

          geography_filts["Regions"] = sorted_regions



          var result = {}
          result["trials"] = trials_filts
          result["populations"] = populations_filts
          result["interventions"] = interventions_filts
          result["outcomes"] = outcome_filts
          result["sponsors"] = sponsor_filts
          result["geography"] = geography_filts
          //console.log("HOWs THIS LOOK: ", trials_filts)


          resolve(result);

      });
    })


}// end of promise





  var all_filters = {
    "Trials": ['Phase', 'Status', 'Purpose', 'Study_Type', 'Randomization', 'Masking_Clean'],
    "Populations": ['Age_Groups', 'Healthy_Volunteers', 'Single_Multi_Site', "Enrollment_Target", "Facility_Settings"],
    "Interventions": ["Intervention_Types"],
    "Outcomes": ['Outcome_Concepts'],
    "Sponsors": ['Sponsor_Type'],
    "Geography": [/* in here should be the exact names from airtable
      this needs work*/
    ]
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

        if (subfilter === "Geography") {
          // create a country list and a region list
          // create a set of unique regions
          for (var trial_regions of regions_list){
            var region_list_index = regions_list.indexOf(trial_regions)
            var country_names = countries_list[region_list_index]
            if (typeof(trial_regions) === 'object'){
              for (var region of trial_regions){
                if (Object.keys(unique_regions).indexOf(region)!==-1){
                      unique_regions[region][country_names[trial_regions.indexOf(region)]] = true;
                } else {
                      unique_regions[region] = {[country_names[trial_regions.indexOf(region)]]: true}
                }
              }
            }
          }
          var sorted_regions = {}
          for (var region of Object.keys(unique_regions)){
            var sorted_countries = {}
            sortDictionary(unique_regions[region], sorted_countries)
            unique_regions[region] = sorted_countries
          }
          sortDictionary(unique_regions, sorted_regions)
          geography_filts["Regions"] = sorted_regions
        }

        else {

        }
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
        mainfilters[subfilter] = unique_subfilters
      }
      result[filter_header] = mainfilters
    }
    return result
  }

  // INSTEAD OF FOR LOOP TO FIND KEY IN DICTIONARY
  function getVal(dictionary, key){
    return dictionary[key];
  }

  // CREATE PIE CHART
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
  function createLineChart(airtable_xAxis, airtable_yAxis, data){
    var line_obj = {};
    for (var record of data){
      let value = getVal(record, airtable_xAxis)
      countOccurrences(line_obj, value)
    }
    let line_list = [];
    let line_formatted = {};
    line_formatting(line_obj, line_list, line_formatted)
    line_formatted.id = airtable_yAxis

    return line_formatted
  }

  // numbars is if you want top 10 bars or all bars or top 20 bars etc
  // indexKey - this is bar of the props of the bar charts

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
        countOccurrences(bar_obj, value)
      }
    }

    var keys = Object.keys(bar_obj).map(function(key){
      return [key, bar_obj[key]];
    });
    keys.sort(function(first, second){
      return second[1] - first[1];
    })
    let updated_bars = {};
    for (var i of keys.slice(0, numBars)){
      updated_bars[i[0]] = i[1]
    }
    let bar_formatted = {};
    bar_formatting(updated_bars, [], bar_formatted, indexKey)
  }

  function createSunburst(level1, level2, level3, data) {
    if (typeof(data[0][level1]) === 'object'){
      var rollupdata = d3.rollup(data, g => g.length, d => d[level1][0], d => d[level2], d => d[level3])
    } else {
      var rollupdata = d3.rollup(data, g => g.length, d => d[level1], d => d[level2], d => d[level3])
    }

    console.log("Rollup: ", rollupdata)
    // now take this and reformat it for as arrays rather than maps
    let wholedata = []
    // console.log(rollupdata.keys())
    for (var key of rollupdata.keys()){
      // for each key
      let name0 = key
      let children0 = []
      // console.log("CHECK", rollupdata.get(key))
      for (var element1 of rollupdata.get(key)){
        //console.log("ELEMENT1: ", element1[0])
        // let element1split = element1[0]
        // for (let elem of element1split){
          let name1 = element1[0]
          let children1 = []
          let middle = {}
          //console.log("NAME1: ", name1)
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
          //console.log("middle: ", middle)


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




  const fetchFilters = async () => {

    const result = await getairtable()
    // console.log("***FILTERS****: ", result)



    setTrialsFilters(result.trials)
    setInterventionsFilters(result.interventions)
    setOutcomesFilters(result.outcomes)
    setSponsorsFilters(result.sponsors)
    setPopulationFilters(result.populations)
    setGeographyFilters(result.geography.Regions)
    setInitialFilterLoadComplete(true)
    // setUpdatedRequested(Date.now())
  }
  useEffect(() => {
    fetchFilters();
  }, [])

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


  //
  /*/////////////////////////////////////////////////////////

  *//////////////////////////////////////////////////////////
  const [landscapeChartData, setLandscapeChartData] = useState([])
  const [landscapeChartHeight, setLandscapeChartHeight] = useState(100)

  const [landscapeMinNodeSize, setLandscapeMinNodeSize] = useState(0)
  const [landscapeMaxNodeSize, setLandscapeMaxNodeSize] = useState(1)
  const [landscapeXAxis, setLandscapeXAxis] = useState("Start_Year")
  const [landscapeYAxis, setLandscapeYAxis] = useState("Facility_Settings")
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



  /*
  This function creates a dictionary where the key is and items name and the value
  is the occurences of that key
  */

  function pie_collection(dictionary, key){
    if(key in dictionary){
      dictionary[key]+=1;
    } else {
      dictionary[key] = 1
    }
  }

  function countOccurrences(dictionary, key){
    if(key in dictionary){
      dictionary[key]+=1;
    } else {
      dictionary[key] = 1
    }
  }

  /*
  Takes a dictionary formated {key: Occurences of key}
  and an empty list and formats the data for a nivo part chart
  in that list
  */
  function pie_formatting(dictionary, pie_data){
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
  function bar_formatting(dictionary, bar_data, bar_formatted, bar_type){
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

  /*
  takes a dictionary with {key: #value(num of key occurences)}
  and two empty lists
  - at the end, the second list is properly formatted for a nivo line graph
  */
  function line_formatting(dictionary, line_data, line_formatted){
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

  // Single Metrics Vars
  var single_metrics_result = {}
  var single_metric_trials = []
  var single_metric_participants = []
  var single_metric_sponsors = new Set()
  var single_metric_outcomes = new Set()
  var single_metric_interventions = 0
  var single_metric_sites = new Set()

  // funtion that sums the values of a list
  function sum(list1){
    const total = list1.reduce(
        (previousScore, currentScore, index)=>previousScore+currentScore,
        0);
        //console.log(total);
      return total;
  }

  var alldata = []

  function getTableData(){
        // var Airtable = require('airtable');
        // var base = new Airtable({apiKey: 'keygbNFWvzaP9t8xi'}).base('appmh47tLfNhe7i80');

          var tab_ind = 0
          var table_data = []

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

              // alldata = table_data
              console.log("ALL data: ", alldata)


              var tabledata = {}
              // for (var record of table_data){
              //   for (var key of Object.keys(record)){
              //     if (typeof(record[key] !== "String")){
              //       record[key] = record[key].toString()
              //     }
              //   }
              // }
              tabledata["tabledata"] = table_data
              resolve(tabledata)
          })
        })
    }



    const fetchAllTableData = async () => {
      const res = await getTableData()
      newgetfilters(alldata)
      const res2 = createSunburst("Sponsor_Type", "Status", "Sponsor", alldata)
      const res3 = createSunburst("Purpose", "Intervention_Types", "Status", alldata)

      //console.log("RES: ", res.tabledata)
      for (var record of res.tabledata){
        for (var key of Object.keys(record)){
          if (typeof(record[key] !== "String")){
            record[key] = record[key].toString()
          }
        }
      }
      setAllTableData(res.tabledata)
      setLoadingAllTableData(false)
      setSponsorsSunburstChart(res2)
      setLoadingSponsorsSunburstChart(false)
      setTrialsSunburstChart(res3)
      setLoadingTrialsSunburstChart(false)
      //console.log("all data as input: ", alldata)


    }

  // GET SINGLE METRICS  from airtable
  function getSingleMetrics() {

    return new Promise((resolve, reject) => {
      base('Trials').select({
          // Selecting the first 3 records in Raw View:
          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.


          records.forEach(function(record) {

            single_metric_trials.push(1)
            var enrollment_type = typeof(record.get('Enrollment'))
            if (enrollment_type === 'number') {
              single_metric_participants.push(record.get('Enrollment'))
            }
            single_metric_sponsors.add(record.get('Sponsor'))

            // intervention_set

            var intervention = record.get('Interventions_Rollup')
            single_metric_interventions += intervention.length

            // outcomes
            var outcome = record.get('Outcome_Concepts')
            if (typeof(outcome)==='object'){
              for (var item of outcome){
                if (item === null){
                  single_metric_outcomes.add(null)
                } else {
                  var itemlist = item.split(", ")
                  for (var j of itemlist){
                    single_metric_outcomes.add(j)
                  }
                }
              }
            } else {
              single_metric_outcomes.add(outcome)
            }

            // sites
            var facility_ids = record.get('Facilities_Links')
            if (typeof(facility_ids)==='object'){
              for (var item of facility_ids){
                if (item === null){
                  single_metric_sites.add(null)
                } else {
                  var itemlist = item.split(", ")
                  for (var j of itemlist){
                    single_metric_sites.add(j)
                  }
                }
              }
            } else {
              single_metric_sites.add(facility_ids)
            }

          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }


          single_metrics_result["trials"] = sum(single_metric_trials);
          single_metrics_result["participants"] = sum(single_metric_participants);
          single_metrics_result["interventions"] = single_metric_interventions;
          single_metrics_result["outcomes"] = single_metric_outcomes.size;
          single_metrics_result["sponsors"] = single_metric_sponsors.size;
          single_metrics_result["sites"] = single_metric_sites.size;

          resolve(single_metrics_result)

      })
    })
}




  const fetchSingleStatMetrics = async () => {

    const result = await getSingleMetrics()
    //console.log("result for single metric: ", result)


    setStats([
      {
        color: 'red',
        stats: [
          { title: 'Trials', metric: result.trials }
        ]
      },
      {
        color: 'orange',
        stats: [
          { title: 'Participants', metric: result.participants }
        ]
      },
      {
        color: 'yellow',
        stats: [
          { title: 'Interventions', metric: result.interventions }
        ]
      },
      {
        color: 'green',
        stats: [
          { title: 'Outcomes', metric: result.outcomes }
        ]
      },

      {
        color: 'blue',
        stats: [
          { title: 'Sponsors', metric: result.sponsors }
        ]
      },

      {
        color: 'violet',
        stats: [
          { title: 'Sites', metric: result.sites }
        ]
      },

    ])
    setLoadingStatsData(false)
  }


  var purpose_pie_dict = {}
  var purpose_pie = [];
  var type_pie_dict = {}
  var type_pie = [];
  var randomization_pie_dict = {}
  var randomization_pie = [];
  var masking_pie_dict = {}
  var masking_pie = [];
  var status_pie_dict = {}
  var status_pie = [];

  var trials_line_dict = {}
  var trials_line = [];
  var trials_line_formatted = {}
  var trials_result = {}

  var age_groups_pie_dict = {}
  var age_groups_pie = [];

  function getTrialsChartsData() {

    return new Promise((resolve, reject) => {
      base('Trials').select({

          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {


          records.forEach(function(record) {
            var age = record.get('Age_Groups')
            for (var item of age){
              pie_collection(age_groups_pie_dict, item)
            }
            pie_collection(purpose_pie_dict, record.get('Purpose'))
            pie_collection(type_pie_dict, record.get('Study_Type'))
            pie_collection(status_pie_dict, record.get('Status'))
            pie_collection(trials_line_dict, record.get('Start_Year'))
            pie_collection(randomization_pie_dict, record.get('Randomization'))
            pie_collection(masking_pie_dict, record.get('Masking_Clean'))

          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }

          pie_formatting(age_groups_pie_dict, age_groups_pie)
          pie_formatting(purpose_pie_dict, purpose_pie)
          pie_formatting(type_pie_dict, type_pie)
          pie_formatting(status_pie_dict, status_pie)
          pie_formatting(randomization_pie_dict, randomization_pie)
          pie_formatting(masking_pie_dict, masking_pie)

          line_formatting(trials_line_dict, trials_line, trials_line_formatted)
          trials_line_formatted.id = 'Trials'

          trials_result["age_pie"] = age_groups_pie;
          trials_result["purpose_pie"] = purpose_pie;
          trials_result["type_pie"] = type_pie
          trials_result["status_pie"] = status_pie
          trials_result["randomization_pie"] = randomization_pie
          trials_result["masking_pie"] = masking_pie
          trials_result["trials_line"] = [trials_line_formatted]
          //console.log(trials_line_formatted)

          resolve(trials_result)

      })
    })
}// end of get trialStatusPieChartData

  const fetchTrialsMetricData = async () => {


    const result = await getTrialsChartsData();
    //console.log("result: ", result)

    setTrialStatusPieChartData(result.status_pie);
    setTrialPurposePieChartData(result.purpose_pie);
    // extra pie here if we want it
    setTrialTypePieChartData(result.type_pie);
    setTrialAgeGroupsPieChartData(result.age_pie);
    setCumulativeTrialsLineChartData(result.trials_line);
    setTrialRandomizationPieChartData(result.randomization_pie);
    setTrialMaskingPieChartData(result.masking_pie);

    setLoadingTrialsData(false)
  }

  let dropdownItems = {
    "Start Year": "Start_Year",
    "Age Groups": "Age_Groups",
    "Sponsors": "Sponsor",
    "Sponsor Types": "Sponsor_Type",
    "Study Types": "Study_Type",
    "Outcomes": "Outcome_Concepts",
    "Settings": "Facility_Settings",
    "Regions": "Geography_Regions",
    "Interventions": "Intervention_Types"
  }

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





  var single_multi_site_dict = {}
  var single_multi_site_pie = [];
  var enrollment_dict = {}
  var enrollment_pie = []
  var population_result = {}
  var volunteers_pie_dict = {}
  var volunteers_pie = [];

  function getPopulationsChartsData() {

    return new Promise((resolve, reject) => {
      base('Trials').select({

          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {



          records.forEach(function(record) {

            pie_collection(single_multi_site_dict, record.get('Single_Multi_Site'))
            pie_collection(enrollment_dict, record.get('Enrollment_Target'))
            pie_collection(volunteers_pie_dict, record.get('Healthy_Volunteers'))

          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }

          pie_formatting(single_multi_site_dict, single_multi_site_pie)
          pie_formatting(volunteers_pie_dict, volunteers_pie)
          pie_formatting(enrollment_dict, enrollment_pie)

          population_result["sites_pie"] = single_multi_site_pie;
          population_result["volunteers_pie"] = volunteers_pie
          population_result["enrollment_pie"] = enrollment_pie

          resolve(population_result)

      })
    })
}// end of get PopulationsData


  const fetchPopulationData = async () => {

    const result = await getPopulationsChartsData()

    setSingleMultiSitePieChartData(result.sites_pie);
    setPopulationVolunteersPieChartData(result.volunteers_pie);
    setPopulationEnrollmentPieChartData(result.enrollment_pie)
    setLoadingPopulationData(false)
  }



  // Outcomes Variables for airtable
  var outcomes_dict = {}
  var outcomes_bar = []
  var outcomes_bar_formatted = {}
  var outcomes_result = {}

  // Get Outcomes data from airtable
  function getOutcomesChartsData() {

    return new Promise((resolve, reject) => {
      base('Trials').select({

          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {

          records.forEach(function(record) {
            // OUTCOMES FILTERS

            var outcome = record.get('Outcome_Concepts')
            if (typeof(outcome)==='object'){
              for (var item of outcome){
                if (item === null){
                  console.log()
                } else {
                  var itemlist = item.split(", ")
                  for (var j of itemlist){

                    pie_collection(outcomes_dict, j)
                  }
                }
              }
            } else {

              pie_collection(outcomes_dict, outcome)
            }



          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }
          //console.log("OUTCOMES DICT: ", outcomes_dict)

          var items = Object.keys(outcomes_dict).map(function(key) {
            return [key, outcomes_dict[key]];
          });

          // Sort the array based on the second element
          items.sort(function(first, second) {
            return second[1] - first[1];
          });

          var updated_outcomes_dict = {}
          for (var item of items.slice(0, 10)){
            updated_outcomes_dict[item[0]] = item[1]
          }


          bar_formatting(updated_outcomes_dict, outcomes_bar, outcomes_bar_formatted, "outcome")
          outcomes_result["outcome_bar"] = outcomes_bar_formatted
          //console.log("OUTCOME data: ", outcomes_bar_formatted)

          resolve(outcomes_result)

      })
    })
  }// end


  // Fetch and set outcomes data
  const fetchOutcomesData = async () => {

    const result = await getOutcomesChartsData()

    setOutcomesTop10ParentBarChartData(result.outcome_bar);
    setLoadingOutcomesData(false)
  }


  // Interventions variables for airtable data
  var interventions_dict = {}
  var interventions_bar = []
  var interventions_line = []
  var interventions_bar_formatted = {}
  var interventions_result = {}
  // Get Intervention data from airtable
  function getInterventionsChartsData() {

    return new Promise((resolve, reject) => {
      base('Trials').select({

          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {

          records.forEach(function(record) {

            var interventions = record.get('Intervention_Types').split(", ")
            for (var item of interventions){
              pie_collection(interventions_dict, item)

            }


          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }
          //console.log("Interventions DICT: ", interventions_dict)

          var items = Object.keys(interventions_dict).map(function(key) {
            return [key, interventions_dict[key]];
          });

          // Sort the array based on the second element
          items.sort(function(first, second) {
            return second[1] - first[1];
          });

          var updated_interventions_dict = {}
          for (var item of items.slice(0, 10)){
            updated_interventions_dict[item[0]] = item[1]
          }


          bar_formatting(updated_interventions_dict, interventions_bar, interventions_bar_formatted, "intervention")
          interventions_result["interventions_bar"] = interventions_bar_formatted
          //console.log("InTERVENtION data: ", interventions_bar_formatted)

          resolve(interventions_result)

      })
    })
  }// end Interventions get function

  const fetchInterventionsData = async () => {

    const result = await getInterventionsChartsData()
    setInterventionsTop10BarChartData(result.interventions_bar);

    setLoadingInterventionsData(false)
  }


  // Sponsors variables for airtable
  var sponsors_dict = {}
  var sponsors_bar = []
  var sponsors_bar_formatted = {}
  var sponsors_result = {}
  // Get Sponsors data from airtable
  function getSponsorsChartsData() {

    return new Promise((resolve, reject) => {
      base('Trials').select({

          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {



          records.forEach(function(record) {

            pie_collection(sponsors_dict, record.get('Sponsor_Type'))


          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }


          bar_formatting(sponsors_dict, sponsors_bar, sponsors_bar_formatted, "sponsor")
          sponsors_result["sponsors_bar"] = sponsors_bar_formatted
          //console.log("SPONSOR data: ", sponsors_bar_formatted)

          resolve(sponsors_result)

      })
    })
}// end of get trialStatusPieChartData




  const fetchSponsorsData = async () => {
        const result = await getSponsorsChartsData()

        setSponsorsTop10ByTrialsBarChartData(result.sponsors_bar);
        // setSponsorsTop10ByEnrollmentBarChartData(result.data.sponsors_top_10_by_enrollment);
        //setSponsorsBreakdownChartData(result.data.sponsors_breakdown);

        setLoadingSponsorsData(false)
      }

      var geography_result = []
      var geography_country_dict = {}

      function geog_formatting(dictionary, geog_data){
        var keys = Object.keys(dictionary);
        var value = Object.values(dictionary);
        for (var i=0; i<keys.length; i++){
          var new_dict = {};
          new_dict["id"] = keys[i];
          new_dict["value"] = value[i];
          geog_data.push(new_dict)
        }
      }


      const cc = require('@genyus/country-code');
      function getGeographyData() {

        return new Promise((resolve, reject) => {
          base('Trials').select({
              // Selecting the first 3 records in Raw View:
              filterByFormula: airtableFilters,
              view: "Raw View"
          }).eachPage(function page(records, fetchNextPage) {
              // This function (`page`) will get called for each page of records.


              records.forEach(function(record) {
                // countries_list.push(record.get('Geography_Countries'))

                var country = record.get('Countries_Rollup_Unique')
                var trial_NCT = record.get('NCT')
                //console.log("NCT: ", trial_NCT, " Country: ", country)
              //  console.log("country 0: ", country[0])

                if (typeof(country)==='object'){
                  for (var item of country){
                    // this if statement is just because the library isn't able to convert it
                    if (item === "Czechia") {
                      pie_collection(geography_country_dict, "CZE")
                    } else {
                      var code = cc.nameIncludes(item)[0].alpha3
                      pie_collection(geography_country_dict, code)

                    }
                  }
                }

              });

              fetchNextPage();

          }, function done(err) {
              if (err) {
                console.error(err);
                return reject({});
              }

              console.log("geog data; ", geography_country_dict)
              geog_formatting(geography_country_dict, geography_result)
              resolve(geography_result)

          })
        })
    }// end of get geographyData


  const fetchGeographyData = async () => {

    const result = await getGeographyData()
    setGeographyFacilitiesChartData(result);
    setLoadingGeographyData(false)
  }


  useEffect(() => {
    if (initialFilterLoadComplete) {
      setLoadingStatsData(true)
      fetchSingleStatMetrics();
      setLoadingTrialsData(true)
      fetchTrialsMetricData();
      setLoadingPopulationData(true)
      fetchPopulationData();
      setLoadingOutcomesData(true)
      fetchOutcomesData();
      setLoadingInterventionsData(true)
      fetchInterventionsData();
      setLoadingSponsorsData(true)
      fetchSponsorsData();
      setLoadingGeographyData(true)
      fetchGeographyData();
      setLoadingAllTableData(true)
      setLoadingSponsorsSunburstChart(true)
      setLoadingTrialsSunburstChart(true)
      fetchAllTableData();

      // console.log("tabledata after fetch: ", fetchAllTableData())
      // setLoadingLandscapeData(true)
      // fetchLandscapeChartData();
      // setData();


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
    console.log("landscape axis: ", axis, value)
    console.log("checking this: ", dropdownItems[value])
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
          // const sponsorParentFilterSections = { ...sponsorsFilters};
          // delete sponsorParentFilterSections.Children
          setActiveParentFilterSections(sponsorsFilters)
          break;
        case 'Geography':
          // const geographyParentFilterSections = { ...geographyFilters};
          // delete geographyParentFilterSections.Children
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
    console.log("first filter: ", filter)
    console.log("first section: ", section)
    if (filter) {
      //console.log('inside PFC and filter is: ', filter)
      switch (activeCategoryFilter) {
        case 'Trials':
          setTrialsFilters(filters => updateFilters(filters, section, filter))
          setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
          if ((filter || trialsFilters[section][filter] === false) && shouldSelect === true){
            //console.log("FILTER: ", filter)
            //console.log("section: ", section)
            //console.log("what is this: ", trialsFilters[section])
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
