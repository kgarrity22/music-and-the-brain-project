import React, { useState, useEffect } from "react";
import { Redirect, withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap'
import axios from 'axios';
import { Auth } from 'aws-amplify';
import * as d3 from 'd3'

import CsvDownloader from 'react-csv-downloader';

import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

import { FaArrowCircleLeft, FaArrowCircleDown } from 'react-icons/fa'

import Navbar from './components/navbar'
import Searchbar from './components/searchbar'
import SearchFilters from './components/search-filters'
import SingleStat from './components/single-stat'
import SectionTitle from './components/section-title'
import PrismPieChart from './components/pie-chart'
import PrismAreaBump from './components/area-bump'
import PrismLineChart from './components/line-chart'
import PrismBarChart from './components/bar-chart'
import PrismSunburst from './components/sunburst-chart'
import PrismScatterplot from './components/scatterplot'
import PrismStaticScatterplot from './components/scatterplot-static'
import PrismChoropleth from './components/choropleth'
import MainTable from './components/tabulator'
import PrismTextBlock from './components/text-block'
import PrismModal from './components/modal'


import './index.css'
import 'react-tabulator/lib/styles.css';
import 'react-tabulator/css/bootstrap/tabulator_bootstrap.min.css';
import 'react-tabulator/lib/styles.css';




const initialStats = [
  {
    color: 'red',
    stats: [
      { title: 'Studies', metric: '--' }
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
      { title: 'Primary Studies', metric: '--' }
    ]
  },
  {
    color: 'green',
    stats: [
      { title: 'Secondary Studies', metric: '--' }
    ]
  },
  {
    color: 'blue',
    stats: [
      { title: 'Measures', metric: '--' }
    ]
  },
]






function DashboardRoute(props) {
  //console.log("is this legal?")

  // const [currentUser, setCurrentUser] = useState("")
  //
  // useEffect((props) => {
  //   const getCurrentAuthenticatedUser = async () => {
  //     try {
  //       const user = await Auth.currentAuthenticatedUser()
  //       setCurrentUser(user)
  //     } catch (error) {
  //       setCurrentUser(undefined)
  //     }
  //   }
  //   getCurrentAuthenticatedUser()
  // }, [currentUser])

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
    console.log("getAirtableFilters")
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

              if (sub_section === "Race/Ethnicity") {
                var new_dict = {"Race_Eth": key}
                store.push(new_dict)
              } else if (sub_section === "Intervention Type"){
                var new_dict = {"Intervention_Type": key}
                store.push(new_dict)
              } else if (sub_section === "Broad Categories"){
                var new_dict = {"Study_Pop_Stnd": key}
                store.push(new_dict)
              } else if (sub_section === "Activity Type"){
                var new_dict = {"Activity_Type": key}
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
    console.log("formatFiltersForAirtable")
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
  var base = new Airtable({apiKey: 'key8POUQgTG9Ubm4J'}).base('appE1OLuKp1Aq9dRl');

//   base('Studies').find('recXiQPjblJD1Z45R', function(err, record) {
//     if (err) { console.error(err); return; }
//     console.log('Retrieved', record.id);
// });
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

function createSunburst(level1, level2, level3, data) {
  if (typeof(data[0][level1]) === 'object'){
    var rollupdata = d3.rollup(data, g => g.length, d => d[level1][0], d => d[level2], d => d[level3])
  } else {
    var rollupdata = d3.rollup(data, g => g.length, d => d[level1], d => d[level2], d => d[level3])
  }

  //console.log("Rollup: ", rollupdata)
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
  //console.log("SUNBURST DATA: ", sunburst_data)
  return sunburst_data
}




  function getairtable() {

    return new Promise((resolve, reject) => {
      base('Studies').select({
          // Selecting the first 3 records in Raw View:
          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.


          records.forEach(function(record) {
            // TRIALS FILTERS
            // phases_set.add(record.get('Phase'))
            // purpose_set.add(record.get('Purpose'))
            // randomization_set.add(record.get('Randomization'))
            // masking_set.add(record.get('Masking_Clean'))

            let comp = record.get('Comparator')
            //console.log("comp: ", comp)
            if (comp.includes(", ")){
              for (let item of comp.split(", ")){
                status_set.add(item)
              }
            } else {
              status_set.add(comp)
            }



            // console.log("status set: ", status_set)
            type_set.add(record.get('Design'))

            ageGroups_set.add(record.get('Race_Eth'))
            healthyVolunteers_set.add(record.get('Gender'))
            singleMultiSite_set.add(record.get('Study_Pop_Stnd'))
            // targEnrollment_set.add(record.get('Enrollment_Target'))





            // INTERVENTIONS FILTERS

            let intervention = record.get('Interventions')
            // console.log("intervention: ", intervention)
            if (intervention !== undefined){
              //console.log("intervention: ", intervention)
              if (intervention.includes(", ")){
                for (let item of intervention.split(", ")){
                  intervention_set.add(item)
                }
              } else {
                intervention_set.add(intervention)
              }
            }

            // console.log("interventions set: ", intervention_set)

            phases_set.add(record.get('Intervention_Type'))
            purpose_set.add(record.get('Activity_Type'))




            // OUTCOMES FILTERS
            let outcomes = record.get('Outcomes')
            for (let outcome of outcomes){
              if (outcome.includes(",")){
                for (let item of outcome.split(",")){
                  outcomes_set.add(item)
                }
              } else {
                outcomes_set.add(outcome)
              }
            }
            //console.log("OUTCOMES: ", outcomes)







            // SPONSORS FILTERS
            let conditions = record.get('Conditions')
            // console.log("condition: ", condition)
            for (let condition of conditions){
              //console.log("conditions; ", condition)
              sponsors_set.add(condition)
            }

            // console.log("CONDItions: ", sponsors_set)



            //console.log("got heree!!!")



            // GEOGRAPHY FILTERs
            // regions_set.add(record.get('Geography_Regions'))
            // regions_list.push(record.get('Geography_Regions'))
            // countries_list.push(record.get('Geography_Countries'))
            let loc = record.get('Location')
            if (loc.slice(0, 1)===" "){
              loc = loc.slice(1, loc.length)
            }
            regions_set.add(loc)

            // console.log("record.get('Location')", record.get('Location'))
            // console.log("record.get('Conditions')", record.get('Conditions'))
            // console.log("record.get('Outcomes')", record.get('Outcomes'))
            // console.log("record.get('Inteerventions')", record.get('Interventions'))
            // console.log("record.get('Intervention_Type')", record.get('Intervention_Type'))
            // console.log("record.get('Activity_Type')", record.get('Activity_Type'))




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

          create_filter_dict([...status_set].sort(), unique_status)
          create_filter_dict([...type_set].sort(), unique_type)



          trials_filts["Design"] = unique_type;



          // POPULATIONS
          create_filter_dict([...ageGroups_set].sort(), unique_ageGroups)
          create_filter_dict([...healthyVolunteers_set].sort(), unique_healthyVolunteers)
          create_filter_dict([...singleMultiSite_set].sort(), unique_singleMultiSite)

          populations_filts["Broad Categories"] = unique_singleMultiSite;
          populations_filts["Gender"] = unique_healthyVolunteers;
          populations_filts["Race/Ethnicity"] = unique_ageGroups;





          // INTERVENTIONS
          create_filter_dict([...intervention_set].sort(), unique_interventions)
          create_filter_dict([...phases_set].sort(), unique_phases)
          create_filter_dict([...purpose_set].sort(), unique_purpose)

          interventions_filts["Interventions"] = unique_interventions
          interventions_filts["Intervention Type"] = unique_phases
          interventions_filts["Activity Type"] = unique_purpose
          interventions_filts["Comparator"] = unique_status;


          // OUTCOMES
          create_filter_dict([...outcomes_set].sort(), unique_outcomes)
          outcome_filts["Outcomes"] = unique_outcomes


          // SPONSORS

          create_filter_dict([...sponsors_set].sort(), unique_sponsors)
          sponsor_filts["Conditions"] = unique_sponsors


          // GEOGRAPHY

          create_filter_dict([...regions_set].sort(), unique_regions)
          geography_filts["Locations"] = unique_regions



          var result = {}
          result["trials"] = trials_filts
          result["populations"] = populations_filts
          result["interventions"] = interventions_filts
          result["outcomes"] = outcome_filts
          result["conditions"] = sponsor_filts
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
  // function newgetfilters(allTableData){
  //   var result = {}
  //   for (var filter_header of Object.keys(all_filters)){
  //     // a filter header will be the big title i.e. Trials or Geography
  //     // want to create a dictionary for each of these
  //     var mainfilters = {}
  //     // the subfilter will be like Type or Age Group or Status
  //     for (var subfilter of all_filters[filter_header]) {
  //       // create a set for the subfilter to get the unique ones
  //
  //       var unique_subfilters = {}
  //       var subfilter_set = new Set()
  //       // now we need to go through the alltabledata and get the values that of the subfilter key
  //
  //       if (subfilter === "Geography") {
  //         // create a country list and a region list
  //         // create a set of unique regions
  //         for (var trial_regions of regions_list){
  //           var region_list_index = regions_list.indexOf(trial_regions)
  //           var country_names = countries_list[region_list_index]
  //           if (typeof(trial_regions) === 'object'){
  //             for (var region of trial_regions){
  //               if (Object.keys(unique_regions).indexOf(region)!==-1){
  //                     unique_regions[region][country_names[trial_regions.indexOf(region)]] = true;
  //               } else {
  //                     unique_regions[region] = {[country_names[trial_regions.indexOf(region)]]: true}
  //               }
  //             }
  //           }
  //         }
  //         var sorted_regions = {}
  //         for (var region of Object.keys(unique_regions)){
  //           var sorted_countries = {}
  //           sortDictionary(unique_regions[region], sorted_countries)
  //           unique_regions[region] = sorted_countries
  //         }
  //         sortDictionary(unique_regions, sorted_regions)
  //         geography_filts["Regions"] = sorted_regions
  //       }
  //
  //       else {
  //
  //       }
  //       for (var item of allTableData){
  //
  //         Object.keys(item).forEach(key => {
  //           if (key === subfilter){
  //             // now need to check what item[key] is
  //             //console.log("key is: ", key)
  //             if (typeof(item[key])==='object'){
  //               for (var i of item[key]){
  //                 if (i === null){
  //                 } else {
  //                   var itemlist = i.split(", ")
  //                   for (var j of itemlist){
  //                     subfilter_set.add(j)
  //                   }
  //                 }
  //               }
  //             } else if (item[key].includes(", ") && item[key] !== "Active, not recruting"){
  //               var itemlist = item[key].split(", ")
  //               for (var j of itemlist){
  //                 subfilter_set.add(j)
  //               }
  //             } else {
  //               subfilter_set.add(item[key])
  //             }
  //           }
  //         })
  //       }
  //       // now when we get here, we will have created the set for one subfilter
  //       // need to pass this subfilter to the create filter dictionary function
  //       create_filter_dict([...subfilter_set].sort(), unique_subfilters)
  //       mainfilters[subfilter] = unique_subfilters
  //     }
  //     result[filter_header] = mainfilters
  //   }
  //   return result
  // }

  // INSTEAD OF FOR LOOP TO FIND KEY IN DICTIONARY
  function getVal(dictionary, key){
    return dictionary[key];
  }

  // CREATE PIE CHART
  // function createPieChart(airtableName, data){
  //   let pie_obj = {}
  //   for (var record of data){
  //     let value = getVal(record, airtableName)
  //     countOccurrences(pie_obj, value)
  //   }
  //   let pie = [];
  //   pieFormatting(pie_obj, pie);
  //
  //   return pie
  // }

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


  const fetchFilters = async () => {
    console.log("made it here in fetch")
    const result = await getairtable()
    console.log("***FILTERS****: ", result)

    setTrialsFilters(result.trials)
    setInterventionsFilters(result.interventions)
    setOutcomesFilters(result.outcomes)
    setSponsorsFilters(result.conditions)
    setPopulationFilters(result.populations)
    setGeographyFilters(result.geography)
    setInitialFilterLoadComplete(true)
    // setUpdatedRequested(Date.now())
  }
  useEffect(() => {
    fetchFilters();
  }, [])

  const generateFiltersPostBody = () => {
    console.log("generateFiltersPostBody")

    return {
      "Studies": trialsFilters,
      "Populations": populationFilters,
      "Interventions": interventionsFilters,
      "Outcomes": outcomesFilters,
      "Conditions": sponsorsFilters,
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
  const [outcomesAreaBump, setOutcomesAreaBump] = useState([])
  const [primaryOutcomesPieData, setPrimaryOutcomesPieData] = useState([])

  // intervention charts original variables
  const [interventionsTop10BarChartData, setInterventionsTop10BarChartData] = useState({data: [], group_keys: []})
  const [interventionTypesPieChartData, setInterventionTypesPieChartData] = useState([])
  const [interventionsBarData, setInterventionsBarData] = useState({data: [], group_keys: []})
  const [comparatorsBarData, setComparatorsBarData] = useState({data: [], group_keys: []})

  const [interventionArmsPieChartData, setInterventionArmsPieChartData] = useState([])
  const [interventionsAreaBumpChart, setInterventionsAreaBumpChart] = useState([])

  // sponsors charts original variables
  const [sponsorsTop10ByTrialsBarChartData, setSponsorsTop10ByTrialsBarChartData] = useState({data: [], group_keys: []})
  const [sponsorTypePieChartData, setSponsorTypePieChartData] = useState([])
  const [sponsorsTop10ByEnrollmentBarChartData, setSponsorsTop10ByEnrollmentBarChartData] = useState({data: [], group_keys: []})
  const [sponsorsBreakdownChartData, setSponsorsBreakdownChartData] = useState([])

  // geography charts original variables
  const [geographyFacilitiesChartData, setGeographyFacilitiesChartData] = useState([])
  const [countriesTop10BarChartData, setCountriesTop10BarChartData] = useState({data: [], group_keys: []})
  const [regionsPieChartData, setRegionsPieChartData] = useState([])

  const [sponsorsSunburstChart, setSponsorsSunburstChart] = useState({})
  const [loadingSponsorsSunburstChart, setLoadingSponsorsSunburstChart] = useState(true)
  const [trialsSunburstChart, setTrialsSunburstChart] = useState({})
  const [loadingTrialsSunburstChart, setLoadingTrialsSunburstChart] = useState(true)


  //
  /*/////////////////////////////////////////////////////////

  *//////////////////////////////////////////////////////////
  const [trialsLandscapeChartData, setTrialsLandscapeChartData] = useState([])
  const [populationsLandscapeChartData, setPopulationsLandscapeChartData] = useState([])
  const [interventionsLandscapeChartData, setInterventionsLandscapeChartData] = useState([])
  const [outcomesLandscapeChartData, setOutcomesLandscapeChartData] = useState([])
  const [sponsorsLandscapeChartData, setSponsorsLandscapeChartData] = useState([])

  // const [landscapeChartHeight, setLandscapeChartHeight] = useState(100)

  const [trialsLandscapeMinNodeSize, setTrialsLandscapeMinNodeSize] = useState(0)
  const [trialsLandscapeMaxNodeSize, setTrialsLandscapeMaxNodeSize] = useState(1)
  const [trialsLandscapeXs, setTrialsLandscapeXs] = useState([])
  const [populationsLandscapeMinNodeSize, setPopulationsLandscapeMinNodeSize] = useState(0)
  const [populationsLandscapeMaxNodeSize, setPopulationsLandscapeMaxNodeSize] = useState(1)
  const [interventionsLandscapeMinNodeSize, setInterventionsLandscapeMinNodeSize] = useState(0)
  const [interventionsLandscapeMaxNodeSize, setInterventionsLandscapeMaxNodeSize] = useState(1)
  const [interventionsYs, setInterventionsYs] = useState([])
  const [outcomesLandscapeMinNodeSize, setOutcomesLandscapeMinNodeSize] = useState(0)
  const [outcomesLandscapeMaxNodeSize, setOutcomesLandscapeMaxNodeSize] = useState(1)
  const [sponsorsLandscapeMinNodeSize, setSponsorsLandscapeMinNodeSize] = useState(0)
  const [sponsorsLandscapeMaxNodeSize, setSponsorsLandscapeMaxNodeSize] = useState(1)



  const [allTableData, setAllTableData] = useState([])
  const [loadingAllTableData, setLoadingAllTableData] = useState(true)




  // loading variables - set the loading icons until the data has fully loaded
  const [loadingStatsData, setLoadingStatsData] = useState(true)
  const [loadingTrialsData, setLoadingTrialsData] = useState(true)
  const [loadingPopulationData, setLoadingPopulationData] = useState(true)
  const [loadingInterventionsData, setLoadingInterventionsData] = useState(true)
  const [loadingOutcomesData, setLoadingOutcomesData] = useState(true)
  const [loadingSponsorsData, setLoadingSponsorsData] = useState(true)
  const [loadingGeographyData, setLoadingGeographyData] = useState(true)

  const [loadingTrialsLandscapeData, setLoadingTrialsLandscapeData] = useState(true)
  const [loadingPopulationsLandscapeData, setLoadingPopulationsLandscapeData] = useState(true)
  const [loadingInterventionsLandscapeData, setLoadingInterventionsLandscapeData] = useState(true)
  const [loadingOutcomesLandscapeData, setLoadingOutcomesLandscapeData] = useState(true)


  const [loadingActivityTypesData, setLoadingActivityTypesData] = useState(true)
  const [mddPieChartData, setMddPieChartData] = useState([])
  const [schizophreniaPieCharData, setSchizophreniaPieCharData] = useState([])
  const [bipolarPieChartData, setBipolarPieChartData] = useState([])
  const [gadPieChartData, setGadPieChartData] = useState([])
  const [ptsdPieChartData, setPtsdPieChartData] = useState([])
  const [activityBarChartData, setActivityBarChartData] = useState({data: [], group_keys: []})
  const [outcomesBarData, setOutcomesBarData] = useState({data: [], group_keys: []})

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

  function areaBumpFormatting(dict, ids, new_list, years) {

    // console.log("neew list: ", new_list)

    for (let id of ids){
      // console.log("id: ", id)
      let data = []
      let data_keys = []
      let area_formatted = {}
      for (let item of Object.keys(dict)){

        let ind = Object.keys(dict).indexOf(item)

        if (item.slice(0, item.indexOf(":")) === id){
          let col = item.indexOf(":")
          let x = item.slice(col+2, item.length)
          // let ob = {x, Object.values(dict)}

          data.push({"x": x, "y": Object.values(dict)[ind]})
          data_keys.push(x)
        }
      }
      for (let year of years){
        if (data_keys.indexOf(year)===-1){
          data.push({"x": year, "y": 0})
        }
      }
      data.sort(function(first, second) {
        return first.x - second.x;
      });
      area_formatted["id"] = id
      area_formatted["data"] = data
      // console.log("area formatted: ", area_formatted)
      new_list.push(area_formatted)
      // console.log("new list: ", new_list)
    }
    //console.log("new List: ", new_list)

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
    console.log("getTableData")
        // var Airtable = require('airtable');
        // var base = new Airtable({apiKey: 'keygbNFWvzaP9t8xi'}).base('appmh47tLfNhe7i80');

          var tab_ind = 0
          var table_data = []

        return new Promise((resolve, reject) => {
          base('Studies').select({

              filterByFormula: airtableFilters,
              view: "Grid view"
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
              //console.log("ALL data: ", alldata)


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
      console.log("did we make it in here: ")
      const res = await getTableData()
    //  newgetfilters(alldata)
    console.log("All DATA Fetching?: ", res)

      // newgetfilters(alldata)
      // let sun = createSunburst("Sponsor_Type", "Intervention_Types", "Status", res.tabledata)
      // console.log("SUN; ", sun)
      // setSponsorsSunburstChart(sun)
      // setLoadingSponsorsSunburstChart(false)
      // let sun2 = createSunburst("Purpose", "Intervention_Types", "Status", res.tabledata)
      // setTrialsSunburstChart(sun2)
      // setLoadingTrialsSunburstChart(false)

      for (var record of res.tabledata){
        for (var key of Object.keys(record)){
          if (typeof(record[key] !== "String")){
            record[key] = record[key].toString()
          }
        }
      }
      setAllTableData(res.tabledata)
      setLoadingAllTableData(false)
      //console.log("all data as input: ", alldata)


    }

  // GET SINGLE METRICS  from airtable
  function getSingleMetrics() {

    return new Promise((resolve, reject) => {
      base('Studies').select({
          // Selecting the first 3 records in Raw View:
          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.


          records.forEach(function(record) {

            single_metric_trials.push(1)
            let enrollment = record.get('Sample_Size')


            if (typeof(enrollment) !== 'number' && !isNaN(parseInt(enrollment))) {

              single_metric_participants.push(parseInt(enrollment))
            }
            // single_metric_sponsors.add(record.get('Sponsor'))

            // intervention_set

            // var intervention = record.get('Interventions_Rollup')
            // single_metric_interventions += intervention.length
            //
            // // outcomes
            let outcome = record.get("Outcomes")
            //console.log("outcome: ", outcome)
            for (let i of outcome) {
              single_metric_outcomes.add(outcome)
            }
            // var outcome = record.get('Outcome_Concepts')
            // if (typeof(outcome)==='object'){
            //   for (var item of outcome){
            //     if (item === null){
            //       single_metric_outcomes.add(null)


          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }


          single_metrics_result["trials"] = sum(single_metric_trials);
          single_metrics_result["participants"] = sum(single_metric_participants);
          // single_metrics_result["interventions"] = single_metric_interventions;
          // single_metrics_result["outcomes"] = single_metric_outcomes.size;
          // single_metrics_result["sponsors"] = single_metric_sponsors.size;
          // single_metrics_result["sites"] = single_metric_sites.size;

          resolve(single_metrics_result)

      })
    })
}




  const fetchSingleStatMetrics = async () => {
    console.log("fetchSingleStatMetrics")
    const result = await getSingleMetrics()
    //console.log("result for single metric: ", result)


    setStats([
      {
        color: 'red',
        stats: [
          { title: 'Studies', metric: result.trials }
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
          { title: 'Primary Studies', metric: 289 }
        ]
      },
      {
        color: 'green',
        stats: [
          { title: 'Secondary Studies', metric: 60 }
        ]
      },

      {
        color: 'blue',
        stats: [
          { title: 'Measures', metric: 271 }
        ]
      },

      // {
      //   color: 'violet',
      //   stats: [
      //     { title: 'Sites', metric: result.sites }
      //   ]
      // },

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
    console.log("getTrialsChartsData")
    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {


          records.forEach(function(record) {
            // var age = record.get('Age_Groups')
            // for (var item of age){
            //   pie_collection(age_groups_pie_dict, item)
            // }
            pie_collection(purpose_pie_dict, record.get('Design'))
            // pie_collection(type_pie_dict, record.get('Study_Type'))
            pie_collection(status_pie_dict, record.get('Results'))
            // pie_collection(trials_line_dict, record.get('Start_Year'))
            // pie_collection(randomization_pie_dict, record.get('Randomization'))
            // pie_collection(masking_pie_dict, record.get('Masking_Clean'))

          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }

          // pie_formatting(age_groups_pie_dict, age_groups_pie)
          pie_formatting(purpose_pie_dict, purpose_pie)
          // pie_formatting(type_pie_dict, type_pie)
          pie_formatting(status_pie_dict, status_pie)
          // pie_formatting(randomization_pie_dict, randomization_pie)
          // pie_formatting(masking_pie_dict, masking_pie)

          // line_formatting(trials_line_dict, trials_line, trials_line_formatted)
          // trials_line_formatted.id = 'Trials'

          // trials_result["age_pie"] = age_groups_pie;
          trials_result["purpose_pie"] = purpose_pie;
          // trials_result["type_pie"] = type_pie
          trials_result["status_pie"] = status_pie
          // trials_result["randomization_pie"] = randomization_pie
          // trials_result["masking_pie"] = masking_pie
          // trials_result["trials_line"] = [trials_line_formatted]
          //console.log(trials_line_formatted)

          resolve(trials_result)

      })
    })
}// end of get trialStatusPieChartData

  const fetchTrialsMetricData = async () => {
    console.log("fetchTrialsMetricData")

    const result = await getTrialsChartsData();
    //console.log("result: ", result)

    setTrialStatusPieChartData(result.status_pie);
    setTrialPurposePieChartData(result.purpose_pie);
    // extra pie here if we want it
    // setTrialTypePieChartData(result.type_pie);
    // setTrialAgeGroupsPieChartData(result.age_pie);
    // setCumulativeTrialsLineChartData(result.trials_line);
    // setTrialRandomizationPieChartData(result.randomization_pie);
    // setTrialMaskingPieChartData(result.masking_pie);

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

  function getTrialsLandscapeChartData() {
    // console.log("did we even make it here?")
    // data list
    let data_list = []
    let uni = new Set()
    let ys = new Set()
    let all = []
    let all_ids = new Set()
    //ys.add("1945")
    let xs = new Set()

    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {


          records.forEach(function(record) {
            //statuses.add(record.get('Status'))
            // get all status
            all.push(record.fields)
            let status = record.get('Design')
            all_ids.add(status)

            let year = record.get('Year')
            xs.add(String(year))
            let date = String(year)

            let ally = String(record.get('Conditions'))

            let z = parseInt(record.get('Sample_Size'))

            let clickId = []
            // console.log(record.get('Covidence_ID'))
            clickId.push(String(record.get('Covidence_ID')))
            // console.log("CLICKID: ", clickId)

            let y_list = ally.split(",")
            let x_list = date.split(",")

            // need to do each y with each x
            for (var y of y_list){
              //console.log("y: ", y)
              if (y !== ""){
                for (var x of x_list){
                  //console.log("x: ", x)
                  if (x !== "") {

                    data_list.push([status, x, y, z, clickId[0]])
                    let as_string = status + "; " + x + "; " + y
                  //  console.log("as string: ", as_string)
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
          let xtype = "Year"
          let ytype = "Conditions"

          let dates = []
          for (let x=1945; x<=2020; x=x+5){
              let num = x+1
              let d = new Date(String(num))
              dates.push(d)

          }
          //console.log("DATES: ", dates)




          //console.log("Ys: ", ys)
          for (var i of uni){

            var ids = i.split("; ")
            let z = 0;
            let clickids = new Set()
            // if (clickids.indexOf(ids[3])===-1){
            //   clickids.push(ids[3])
            // }

            for (var arr of data_list){

              if (ids[0] === arr[0] && ids[1]===arr[1] && ids[2]===arr[2]){
                z += arr[3]
                clickids.add(arr[4])
                // if (clickids.indexOf(arr[4])===-1){
                //   clickids.push(arr[4])
                // }
              }
            }

            let item = {}
            let limited = {}
            let list_ids = [...clickids]

            let list_all = [...all_ids]

            for (let status of list_all){
              // console.log("status: ", status)
              let l1 = []
              for (let j of all){
                // console.log("J: ", j)
              //  console.log("TYPE of : ", typeof(j.Design))
                if (typeof(j.Design) !== 'undefined'){
                  // console.log(j[ytype], j.Design, j[xtype], status, ids[1], ids[2])
                  //console.log("CHECK: ", typeof(j[xtype]), typeof(ids[1]))
                  //console.log((j[xtype])===(ids[1]), (j[ytype]).includes(ids[2]), (j.Design).includes(status))
                  if (j[xtype] === parseInt(ids[1]) && (j[ytype]).includes(ids[2]) && (j.Design).includes(status)){
                    l1.push(j)
                    //console.log("JJJ")
                  }
                  //console.log("l1: ", l1)
                }
              }
            //  console.log("L1: ", l1)
              if (l1.length!==0){
                limited[status] = l1
                // limited.push(l1)
              }


            }
            //console.log("LIMITED: ", limited)
            //console.log("ids[1]: ", ids[1], typeof(ids[1]))
            item[ids[0]] = {"x": ids[1], "y": ids[2], "z": z, "clickId": list_ids, "all": limited, "xtype": xtype, "ytype": ytype}

            new_data_list.push(item)
          }
          // let dict = {}
          // dict[""] = {"x": "1945", "y": "", "z": -1}
          // dict[""] = {"x": "1946", "y": "", "z": -1}
          // dict[""] = {"x": "1948", "y": "", "z": -1}
          // dict[""] = {"x": "1943", "y": "", "z": -1}
          // dict[""] = {"x": "1942", "y": "", "z": -1}


          // dict[""] = {"x": "1944", "y": "", "z": -1}
          // dict[""] = {"x": "1943", "y": "", "z": -1}

          // new_data_list.push(dict)
          console.log("new LIST: ", new_data_list)

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
          // setTrialsLandscapeChartHeight(ys.size * 50 + 300)
          let landscape_result={}
          // console.log("CHECK THIS DATA: ", all_data)
          console.log("XS: ", xs)
          landscape_result["data"] = all_data
          landscape_result["max"] = Math.max(...zs)
          let filtered = zs.filter(item => item !== 0)
          console.log("filtered: ", filtered)
          landscape_result["min"] = Math.min(...zs)
          landscape_result["dates"] = dates
          console.log("LANDscape RESul; ", landscape_result)
          resolve(landscape_result)

        })
      })
  }// end of get trialStatusPieChartData

  function getPopulationsLandscapeChartData() {
    // data list
    //console.log("getPopulationsChartsData")
    let data_list = []
    let uni = new Set()
    let ys = new Set()
    let all = []
    let all_ids = new Set()

    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {


        records.forEach(function(record) {
          //statuses.add(record.get('Status'))
          // get all status
          all.push(record.fields)
          let status = record.get('Results')
          all_ids.add(status)

          let allx = String(record.get('Comparator'))

          let ally = String(record.get('Interventions'))
        //  console.log("ALLY : ", ally)
          // console.log("COMPARATOR: ", allx)
          // console.log("alls: ", allx, ally)
          //let z = record.get('landscapeZAxis')
          let z = 0
          if (!isNaN(parseInt(record.get('Sample_Size')))){
            z = parseInt(record.get('Sample_Size'))
          }


          let clickId = []
          clickId.push(String(record.get('Covidence_ID')))

          let y_list = ally.split(", ")
          //console.log("CHECKINg ys: ", ally)
          // if (ally==="Other CAM, Different Art Therapy (Drama, Visual art, Creative Play)") {
          //   y_list = ["Other CAM", "Different Art Therapy (Drama, Visual art, Creative Play)"]
          // }
          // if (ally==="Different Art Therapy (Drama, Visual art, Creative Play)"){
          //   y_list = ["Different Art Therapy (Drama, Visual art, Creative Play)"]
          // }


          let x_list = []
          if (typeof(allx)!=="undefined"){
            x_list = allx.split(",")
          }

          // need to do each y with each x
          for (var y of y_list){
            if (y !== ""){
              if (y === "N/A"){
                y = " N/A"
              }
              if (y.charAt(0)===" "){
                y = y.slice(1, y.length)
              }
              //onsole.log("Y: ", y)
              if (y !== 'undefined'){
                all_ids.add(y)
              }
              for (var x of x_list){
                //console.log("x: ", x)
                if (x !== "") {

                  data_list.push([status, x, y, z, clickId[0]])
                  let as_string = status + "; " + x + "; " + y
                //  console.log("as string: ", as_string)
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
          let xtype = 'Comparator'
          let ytype = 'Interventions'

          //console.log("Ys: ", ys)
          for (var i of uni){

            var ids = i.split("; ")
            let z = 0;
            // for (var arr of data_list){
            //   if (ids[0] === arr[0] && ids[1]===arr[1] && ids[2]===arr[2]){
            //     z += arr[3]
            //   }
            // }

              let clickids = new Set()
              // if (clickids.indexOf(ids[3])===-1){
              //   clickids.push(ids[3])
              // }

              for (var arr of data_list){

                if (ids[0] === arr[0] && ids[1]===arr[1] && ids[2]===arr[2]){
                  //console.log("arr[3]: ", arr[3])
                  z += arr[3]
                  // if (clickids.indexOf(arr[4])===-1){
                  //   clickids.push(arr[4])
                  // }
                  clickids.add(arr[4])
                }
              }

              let item = {}
              let limited = {}
              let list_ids = [...clickids]

              //console.log("is this atHING: ", [...all_ids])
              let list_all = [...all_ids]
              for (let status of list_all){
                let l1 = []
                for (let j of all){
                  if (typeof(j.Interventions) !== 'undefined' && typeof(j.Comparator) !== 'undefined'){
                    //console.log("type check: ", j[xtype], j[ytype], j.Results)
                    if ((j[xtype]).includes(ids[1]) && (j[ytype]).includes(ids[2]) && j.Results === status){
                      l1.push(j)
                      //console.log("JJJ: ", j)
                    }

                  }

                }
                //console.log("L1: ", l1)
                if (l1.length!==0){
                  limited[status] = l1
                  // limited.push(l1)
                }


              }
              //console.log("LIMITED: ", limited)



              // for (let j of all) {
              //   if (list_ids.indexOf(String(j.Covidence_ID))!==-1){
              //     limited.push(j)
              //   }
              // }
              if (ids[2]!=="undefined"){
                item[ids[0]] = {"x": ids[2], "y": ids[1], "z": z, "clickId": list_ids, "all": limited, "xtype": xtype, "ytype": ytype}

                new_data_list.push(item)
              }




          }
          //console.log("new LIST: ", new_data_list)

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
            let tosort = clean_data[item]
            tosort.sort(function(first, second) {
              //console.log("first: ", first.y)
              if (first.y > second.y){
                return 1
              } else if (first.y <= second.y){
                return -1
              }
                // return second_item.z - first_item.z;
            });
            //console.log("tosort: ", tosort)
            cleaned["data"] = tosort
            // console.log("data: ", clean_data[item])
            all_data.push(cleaned)
          }
          all_data.sort(function(first, second) {
            //console.log("checking for SORTING: ", second.data)
            return second.data.length - first.data.length;
          });
          // setTrialsLandscapeChartHeight(ys.size * 50 + 300)
          let landscape_result={}
          // console.log("CHECK THIS DATA: ", all_data)
          landscape_result["data"] = all_data
          landscape_result["max"] = Math.max(...zs)
          // let filtered = zs.filter(item => item !== 0)
          // console.log("filtered: ", filtered)
          landscape_result["min"] = Math.min(...zs)
          console.log("First Landscape res: ", landscape_result)
          resolve(landscape_result)

        })
      })
  }// end of get trialStatusPieChartData

  function getInterventionsLandscapeChartData() {
    //console.log("getInterventionsLandscapeChartData")
    // data list
    let data_list = []
    let uni = new Set()
    let ys = new Set()
    let all = []
    let all_ids = new Set()

    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {


          records.forEach(function(record) {
            //statuses.add(record.get('Status'))
            // get all status
            all.push(record.fields)
            let status = record.get('Results')
            // all_ids.add(status)

            let allx = String(record.get('Outcomes'))

            let ally = String(record.get('Interventions'))
            // console.log("INTERVEN: ", ally)
            let z = 0
            if (!isNaN(parseInt(record.get('Sample_Size')))){
              z = parseInt(record.get('Sample_Size'))
            }


            let clickId = []
            clickId.push(String(record.get('Covidence_ID')))

            // console.log("Ys check: ", )
            let y_list = ally.split(",")
            let x_list  = allx.split(",")
            // need to do each y with each x
            for (var y of y_list){
              if (y !== ""){
                if (y === "N/A"){
                  y = " N/A"
                }
                if (y.charAt(0)===" "){
                  y = y.slice(1, y.length)
                }
                //onsole.log("Y: ", y)
                if (y !== 'undefined'){
                  all_ids.add(y)
                }

                for (var x of x_list){
                  if (x !== "") {

                    data_list.push([y, x, status, z, clickId[0]])
                    let as_string = y + "; " + x + "; " + status
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

          let xs = []
          console.log("UNI: ", uni)
          let xtype = "Outcomes"
          let ytype = "Interventions"




          //console.log("Ys: ", ys)
          for (var i of [...uni].sort()){

            var ids = i.split("; ")
            let z = 0;
            //console.log("IDS: ", ids)

            let clickids = new Set()
            // clickids.add(ids[3])
            // if (clickids.indexOf(ids[3])===-1){
            //   clickids.push(ids[3])
            // }

            for (var arr of data_list){
              //console.log("Arr: ", arr)
              // clickids.add()
              if (ids[0] === arr[0] && ids[1]===arr[1] && ids[2]===arr[2]){
                z += arr[3]
                // if (clickids.indexOf(arr[4])===-1){
                //   clickids.push(arr[4])
                // }
                clickids.add(arr[4])
              }
            }

            let item = {}
            let limited = {}
            let list_ids = [...clickids]
            //console.log("is this atHING: ", [...all_ids])
            let list_all = [...all_ids]
          //  console.log("list ALL: ", list_all)
            for (let status of list_all){
              //console.log("status: ", status)
              let l1 = []
              for (let j of all){

                if (typeof(j.Interventions) !== 'undefined'){
                  //console.log(typeof(j["Interventions"]))
                  //console.log(j[xtype], j[ytype], j.Interventions)
                  //console.log("ARE any TRUE: ",((j[xtype]).includes(ids[1]) && (j[ytype]).includes(ids[2]) && (j["Interventions"]).includes(ids[0])))
                  //console.log("interventions: ", j.Interventions)
                  //console.log("j[xtype] vs ids[1]", j[ytype],  ids[0])
                  if ((j[xtype]).includes(ids[1]) && (j[ytype]).includes(ids[0]) && (j.Interventions).includes(status)){
                    l1.push(j)
                    //console.log("JJJ")
                  }
                  //console.log("l1: ", l1)
                }
              }
            //  console.log("L1: ", l1)
              if (l1.length!==0){
                limited[status] = l1
                // limited.push(l1)
              }


            }
            //console.log("LIMITED: ", limited)
            if (ids[0]!=="undefined"){
              item[ids[2]] = {"x": ids[0], "y": ids[1], "z": z, "clickId": list_ids, "all": limited, "xtype": xtype, "ytype": ytype}
              new_data_list.push(item)
            }

          }


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

          all_data.sort(function(first, second) {
            return second.data.length - first.data.length;
          });
          // setLandscapeChartHeight(ys.size * 50 + 300)

          var landscape_result={}
          landscape_result["data"] = all_data
          landscape_result["max"] = Math.max(...zs)
          let filtered = zs.filter(item => item !== 0)
          //console.log("filtered: ", filtered)
          landscape_result["min"] = Math.min(...filtered)
          landscape_result["ys"] = [...ys].sort()
          console.log("INTERventions LAnd: ", landscape_result)
          resolve(landscape_result)

        })
      })
  }// end of get trialStatusPieChartData



  function getOutcomesLandscapeChartData() {
    //console.log("getOutcomesLandscapeChartData")
    // data list
    let data_list = []
    let uni = new Set()
    let ys = new Set()
    let all = []
    let all_ids = new Set()

    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {


          records.forEach(function(record) {

            all.push(record.fields)
            let status = record.get('Results')

            let allx = String(record.get('Conditions'))
            let ally = String(record.get('Outcomes'))
            let z = parseInt(record.get('Sample_Size'))
            let clickId = []
            clickId.push(String(record.get('Covidence_ID')))
            // console.log("Z: ", z)

            let y_list = ally.split(",")

            let x_list = allx.split(",")
            //console.log("X-LIST: ", x_list)

            // need to do each y with each x
            for (var y of y_list){
              if (y !== ""){
                for (var x of x_list){
                  if (x !== "") {
                    if (y[0]===" "){
                      y = y.slice(1, y.length)
                    }
                    all_ids.add(y)
                    data_list.push([y, x, status, z, clickId[0]])
                    let as_string = y + "; " + x + "; " + status
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
          let xs = []
          let xtype = 'Outcomes'
          let ytype = 'Conditions'



          //console.log("OUTCOMES: ", [...uni].sort())
          for (var i of [...uni].sort()){

            var ids = i.split("; ")
            let z = 0;
            let clickids = new Set()
            // if (clickids.indexOf(ids[3])===-1){
            //   clickids.push(ids[3])
            // }

            for (var arr of data_list){

              if (ids[0] === arr[0] && ids[1]===arr[1] && ids[2]===arr[2]){
                z += arr[3]
                // if (clickids.indexOf(arr[4])===-1){
                //   clickids.push(arr[4])
                // }
                clickids.add(arr[4])
              }
            }

            let item = {}
            let limited = {}
            let list_ids = [...clickids]
            let list_all = [...all_ids]
            for (let status of list_all){
              let l1 = []
              for (let j of all){
                //console.log("type check: ", j[xtype], status)
                if ((j[xtype]).includes(status) && (j[ytype]).includes(ids[1]) && (j.Results).includes(ids[2])){
                  l1.push(j)
                  //console.log("JJJ: ", j)
                }
              }
              //console.log("L1: ", l1)
              if (l1.length!==0){
                limited[status] = l1
                // limited.push(l1)
              }
            }

            item[ids[2]] = {"x": ids[0], "y": ids[1], "z": z, "clickId": list_ids, "all": limited, "xtype": xtype, "ytype": ytype}

            new_data_list.push(item)
          }

          for (var j of new_data_list){
            let stat = Object.keys(j)[0]
            let val = Object.values(j)

            if (isNaN(val[0]["z"])){
              // console.log("z: ", val[0]["z"])
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

        //  console.log("clean data: ", clean_data)
          var all_data=[]
          for (var item of Object.keys(clean_data)){
            var cleaned = {}
            cleaned["id"] = item
            cleaned["data"] = clean_data[item]
            all_data.push(cleaned)
          }
          // setLandscapeChartHeight(ys.size * 50 + 300)
          //console.log("OUTCOMES LAND: ", alldata)
          //console.log("landsape all data: ", all_data)

          // Sort the array based on the second element
          // items.sort(function(first, second) {
          //   return second[1] - first[1];
          // });
          all_data.sort(function(first, second) {
            return second.data.length - first.data.length;
          });


          var landscape_result={}
          landscape_result["data"] = all_data
          landscape_result["max"] = Math.max(...zs)
          let filtered = zs.filter(item => item !== 0)
          //console.log("filtered: ", filtered)
          landscape_result["min"] = Math.min(...filtered)

          console.log("outcome landscape res: ", landscape_result)


          resolve(landscape_result)

        })
      })
  }// end of get trialStatusPieChartData

  function getSponsorsLandscapeChartData() {
    //console.log("getSponsorsLandscapeChartData")
    let sponsors_dict = {}
    let data_list = []
    let uni = new Set()
    let ys = new Set()
    let all = []

    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {


          records.forEach(function(record) {
            //statuses.add(record.get('Status'))
            // get all status
            all.push(record.fields)
            let status = record.get('Status')
            let month = String(record.get('Start_Month'))
            let year = String(record.get('Start_Year'))
            //console.log("month check: ", month)
            let date = ''
            if (month.length === 1){
              date = year + "-0" + month
            } else {
              date = year + "-" + month
            }
            let clickId = []
            clickId.push(String(record.get('Covidence_ID')))

            // let allx = date.split(",")


            let ally = String(record.get('Sponsor'))
            pie_collection(sponsors_dict, ally)
            let z = record.get("Enrollment")

            let y_list = ally.split(",")
            let x_list = date.split(",")

            // need to do each y with each x
            for (var y of y_list){
              if (y !== ""){
                for (var x of x_list){
                  if (x !== "") {
                    data_list.push([y, x, status, z, clickId[0]])
                    let as_string = y + "; " + x + "; " + status
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

          var items = Object.keys(sponsors_dict).map(function(key) {
            return [key, sponsors_dict[key]];
          });

          // Sort the array based on the second element
          items.sort(function(first, second) {
            return second[1] - first[1];
          });

          var updated_sponsors_dict = {}
          //console.log("items to sort: ", items.slice(0, 20).sort())

          for (var item of items.slice(0, 20)){
            updated_sponsors_dict[item[0]] = item[1]
          }
          //console.log("updated sponsors: ", updated_sponsors_dict)

          let new_data_list = []
          let clean_data = {}
          let zs = []
          let clickids = []
          //console.log("Ys: ", ys)
          let sorted = [...uni].sort()
          //console.log("UNI: ", sorted)
          for (var i of sorted){

            var ids = i.split("; ")
            // if (clickids.indexOf(ids[3])===-1){
            //   clickids.push(ids[3])
            // }
            let clickids = new Set()
            let z = 0;
            for (var arr of data_list){
              if (ids[0] === arr[0] && ids[1]===arr[1] && ids[2]===arr[2]){
                z += arr[3]
                // if (clickids.indexOf(arr[4])===-1){
                //   clickids.push(arr[4])
                // }
                clickids.add(arr[4])
              }
            }
            let item = {}
            let list_ids = [...clickids]
            let limited = []
            for (let j of all) {
              if (list_ids.indexOf(String(j.Covidence_ID))!==-1){
                limited.push(j)
              }
            }
            // console.log("IDS2: ", ids[2])
            if (Object.keys(updated_sponsors_dict).indexOf(ids[0])!==-1){
              item[ids[2]] = {"x": ids[1], "y": ids[0], "z": z, "clickIds": list_ids, "all": limited}
              new_data_list.push(item)
            }

          }
          new_data_list.sort(function(first, second) {
            //console.log("first: ", Object.values(first)[0]["x"])
            let keyname1 = Object.keys(first)[0]
            let keyname2 = Object.keys(second)[0]
            //console.log("KEYNAMES: ", keyname1, keyname2)
            //console.log("first.keyname1, first.keyname2: ", first[keyname1].x, second[keyname2].x)
            return second[keyname2] - first[keyname1];
          });
          //console.log("NEW DATA LIST: ", new_data_list)
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

          // setLandscapeChartHeight(ys.size * 50 + 300)
          var landscape_result={}
          landscape_result["data"] = all_data
          landscape_result["max"] = Math.max(...zs)
          let filtered = zs.filter(item => item !== 0)
          console.log("filtered: ", filtered)
          landscape_result["min"] = Math.min(...filtered)
          console.log("SPONSORS LANDSCAPE: ", all_data)
          resolve(landscape_result)

        })
      })
  }// end of get trialStatusPieChartData



  const fetchTrialsLandscapeChartData = async () => {
    //console.log("are we getting into fetch landscape chart data?")
    const trials = await getTrialsLandscapeChartData()

    setTrialsLandscapeChartData(trials.data);
    setTrialsLandscapeMinNodeSize(trials.min);
    setTrialsLandscapeMaxNodeSize(trials.max);
    setTrialsLandscapeXs(trials.dates)

    setLoadingTrialsLandscapeData(false)
  }

  const fetchPopulationsLandscapeChartData = async () => {
    const pops = await getPopulationsLandscapeChartData()

    setPopulationsLandscapeChartData(pops.data);
    setPopulationsLandscapeMinNodeSize(pops.min);
    setPopulationsLandscapeMaxNodeSize(pops.max);
    setLoadingPopulationsLandscapeData(false)
  }

  const fetchInterventionsLandscapeChartData = async () => {
    const interventions = await getInterventionsLandscapeChartData()
    setInterventionsLandscapeChartData(interventions.data);
    setInterventionsLandscapeMinNodeSize(interventions.min);
    setInterventionsLandscapeMaxNodeSize(interventions.max);
    setLoadingInterventionsLandscapeData(false)
  }

  const fetchOutcomesLandscapeChartData = async () => {
    const outcomes = await getOutcomesLandscapeChartData()
    setOutcomesLandscapeChartData(outcomes.data);
    setOutcomesLandscapeMinNodeSize(outcomes.min);
    setOutcomesLandscapeMaxNodeSize(outcomes.max);
    setLoadingOutcomesLandscapeData(false)
  }


  function getActivityTypesChartsData(){
    let activityPies = {}

    let mdd_dict = {}
    let mdd_pie = [];
    let schizophrenia_dict = {}
    let schizophrenia_pie = []
    let bipolar_dict = {}
    let bipolar_pie = [];
    let gad_dict = {}
    let gad_pie = [];
    let ptsd_dict = {}
    let ptsd_pie = [];



    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {



          records.forEach(function(record) {

            if ((record.get("Conditions")).includes("Major Depressive Disorder")){
              pie_collection(mdd_dict, record.get("Activity_Type"))
            }
            if ((record.get("Conditions")).includes("Generalized Anxiety Disorder")){
              pie_collection(gad_dict, record.get("Activity_Type"))
            }
            if ((record.get("Conditions")).includes("Post-traumatic Stress Disorder")){
              pie_collection(ptsd_dict, record.get("Activity_Type"))
            }
            if ((record.get("Conditions")).includes("Bipolar disorder")){
              pie_collection(bipolar_dict, record.get("Activity_Type"))
            }
            if ((record.get("Conditions")).includes("Schizophrenia")){
              pie_collection(schizophrenia_dict, record.get("Activity_Type"))
            }


          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }

          pie_formatting(mdd_dict, mdd_pie)
          pie_formatting(gad_dict, gad_pie)
          pie_formatting(ptsd_dict, ptsd_pie)
          pie_formatting(bipolar_dict, bipolar_pie)
          pie_formatting(schizophrenia_dict, schizophrenia_pie)
          let groupkeys = Object.keys(mdd_dict)

          mdd_dict["type"] = "Major Depressive Disorder"
          gad_dict["type"] = "Generalized Anxiety Disorder"
          ptsd_dict["type"] = "Post-traumatic Stress Disorder"
          bipolar_dict["type"] = "Bipolar Disorder"
          schizophrenia_dict["type"] = "Schizophrenia"
          let activity_bar = []
          activity_bar.push(mdd_dict)
          activity_bar.push(gad_dict)
          activity_bar.push(ptsd_dict)
          activity_bar.push(bipolar_dict)
          activity_bar.push(schizophrenia_dict)

          let bar = {}
          bar["data"] = activity_bar
          bar["group_keys"] = groupkeys
          activityPies["mdd_pie"] = mdd_pie
          activityPies["gad_pie"] = gad_pie
          activityPies["ptsd_pie"] = ptsd_pie
          activityPies["bipolar_pie"] = bipolar_pie
          activityPies["schizophrenia_pie"] = schizophrenia_pie
          activityPies["bar"] = bar

          resolve(activityPies)

      })
    })
  }

  const fetchActivityTypesData = async () => {
    // console.log("fetchPopulationData")
    const result = await getActivityTypesChartsData()

    setMddPieChartData(result.mdd_pie)
    setGadPieChartData(result.gad_pie)
    setPtsdPieChartData(result.ptsd_pie)
    setBipolarPieChartData(result.bipolar_pie)
    setSchizophreniaPieCharData(result.schizophrenia_pie)
    setActivityBarChartData(result.bar)
    setLoadingActivityTypesData(false)
  }





  var single_multi_site_dict = {}
  var single_multi_site_pie = [];
  var settings_dict = {}
  var settings_pie = []
  var population_result = {}
  var volunteers_pie_dict = {}
  var volunteers_pie = [];

  function getPopulationsChartsData() {
    //console.log("getPopulationsChartsData")
    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {



          records.forEach(function(record) {

            pie_collection(single_multi_site_dict, record.get('Single_Multi_Site'))


            let settings = record.get('Facility_Settings')
            if (typeof(settings)==='object'){
              for (var item of settings){
                //console.log("item: ", item)
                pie_collection(settings_dict, item)
              }
            } else {
              pie_collection(settings_dict, settings)
            }
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
          pie_formatting(settings_dict, settings_pie)

          population_result["sites_pie"] = single_multi_site_pie;
          population_result["volunteers_pie"] = volunteers_pie
          population_result["settings_pie"] = settings_pie

          resolve(population_result)

      })
    })
}// end of get PopulationsData


  const fetchPopulationData = async () => {
    //console.log("fetchPopulationData")
    const result = await getPopulationsChartsData()

    setSingleMultiSitePieChartData(result.sites_pie);
    setPopulationVolunteersPieChartData(result.volunteers_pie);
    setPopulationEnrollmentPieChartData(result.settings_pie)
    setLoadingPopulationData(false)
  }



  // Outcomes Variables for airtable
  var outcomes_dict = {}
  var outcomes_bar = []
  var outcomes_bar_formatted = []
  var outcomes_result = {}
  let outcomes_pie_dict = {}
  let primary_outcomes_pie = []

  let outcome_areabump_result = []
  let outcome_area_bump = []
  let outcome_area_unique = new Set()
  let outcome_area_dict = {}
  let years = new Set()




  // Get Outcomes data from airtable
  function getOutcomesChartsData() {
    let outcomes_bar_dict = {}
    //Let outcomes_bar = []

    // console.log("getOutcomesChartsData")
    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {

          records.forEach(function(record) {
            let outcome = record.get('Outcomes')


            for (let i of outcome){
              pie_collection(outcomes_bar_dict, i)
            }



          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }
          //console.log("OUTCOMES DICT: ", outcomes_dict)
          let group_keys = Object.keys(outcomes_bar_dict)
          let res = []
          for (let single of group_keys){
            let small = {}
            small[single] = outcomes_bar_dict[single]
            small["type"] = single
            res.push(small)
          }
        //  console.log("RES: ", res)
          res.sort(function(first, second) {
            let type1 = first.type
            let type2 = second.type
            return second[type2] - first[type1];
          });

          let bar = {}
          bar["data"] = res
          bar["group_keys"] = group_keys


          outcomes_result["outcomes_bar"] = bar

          resolve(outcomes_result)

      })
    })
  }// end


  // Fetch and set outcomes data
  const fetchOutcomesData = async () => {
    // console.log("fetchOutcomesData")
    const result = await getOutcomesChartsData()
    setOutcomesBarData(result.outcomes_bar)
    // setPrimaryOutcomesPieData(result.primary_outcomes_pie)
    // setOutcomesTop10ParentBarChartData(result.outcome_bar)
    // setOutcomesAreaBump(result.area_bump)
    // setLoadingOutcomesData(false)
  }


  // Interventions variables for airtable data
  let interventions_types_dict = {}
  var intervention_types_pie = []
  var interventions_arms_dict = {}
  var intervention_arms_pie = []
  var interventions_line = []

  let interventions_areabump_result = []
  let interventions_area_bump = []
  let interventions_area_unique = new Set()
  let intervention_area_dict = {}
  let int_dates = new Set()
  // var interventions_bar_formatted = {}
  var interventions_result = {}
  // Get Intervention data from airtable
  function getInterventionsChartsData() {
    // console.log("getInterventionsChartsData")
    let interventions_bar_dict = {}
    let comparator_bar_dict = {}
//Let outcomes_bar = []



    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {

          records.forEach(function(record) {

            // }
            pie_collection(interventions_types_dict, record.get('Activity_Type'))
            let comp = record.get('Comparator')
            let allcomp = []
            if (comp === "Other CAM, Different Art Therapy (Drama, Visual art, Creative Play)"){
              allcomp = ["Other CAM", "Different Art Therapy (Drama, Visual art, Creative Play)"]
            } else if (comp === "Different Art Therapy (Drama, Visual art, Creative Play)") {
              allcomp = ["Different Art Therapy (Drama, Visual art, Creative Play)"]

            } else {
              allcomp = comp.split(",")

            }

            for (let i of allcomp){
              if (i.charAt(0) === " "){
                i = i.slice(1, i.length)
              }
              pie_collection(comparator_bar_dict, i)
            }


            let int = record.get("Interventions")


            if (typeof(int)!=="undefined"){
              for (let i of int.split(",")){
                pie_collection(interventions_bar_dict, i)
              }
            }

          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }
          //areaBumpFormatting(intervention_area_dict, [...interventions_area_unique].sort(), interventions_areabump_result, int_dates)
          // console.log("AREA BUMP CHECK: ", outcome_areabump_result)
          pie_formatting(interventions_types_dict, intervention_types_pie)
          let group_keys = Object.keys(interventions_bar_dict)
          let res = []
          for (let single of group_keys){
            let small = {}
            small[single] = interventions_bar_dict[single]
            small["type"] = single
            res.push(small)
          }

          let bar = {}

          res.sort(function(first, second) {
            let type1 = first.type
            let type2 = second.type
            return second[type2] - first[type1];
          });
          // interventions_bar_dict["int"] = "Interventions"
          bar["data"] = res
          bar['group_keys'] = group_keys

          let group_keys2 = Object.keys(comparator_bar_dict)
          let res2 = []
          for (let single of group_keys2){
            let small = {}
            small[single] = comparator_bar_dict[single]
            small["type"] = single
            res2.push(small)
          }
          let bar2 = {}
          res2.sort(function(first, second) {
            let type1 = first.type
            let type2 = second.type
            return second[type2] - first[type1];
          });
          // comparator_bar_dict["comp"] = "Comparators"
          bar2["data"] = res2
          bar2['group_keys'] = group_keys2
        //  pie_formatting(interventions_arms_dict, intervention_arms_pie)
          interventions_result["intervention_types_pie"] = intervention_types_pie
          interventions_result["intervention_bar"] = bar
          interventions_result["comparator_bar"] = bar2
          //console.log('BAR2:', bar2)
          // interventions_result["intervention_arms_pie"] = intervention_arms_pie
          // interventions_result["interventions_areabump_result"] = interventions_areabump_result

          resolve(interventions_result)

      })
    })
  }// end Interventions get function

  const fetchInterventionsData = async () => {
    //console.log("fetchInterventionsData")
    const result = await getInterventionsChartsData()
    // setInterventionsTop10BarChartData(result.interventions_bar);
    // console.log("compare this bar: ", result.interventions_bar)
    setInterventionTypesPieChartData(result.intervention_types_pie)
    setInterventionsBarData(result.intervention_bar)
    setComparatorsBarData(result.comparator_bar)

    //setInterventionArmsPieChartData(result.intervention_arms_pie)
    // setInterventionsAreaBumpChart(result.interventions_areabump_result)
    setLoadingInterventionsData(false)
  }


  // Sponsors variables for airtable
  var sponsor_types_dict = {}
  let sponsors_dict = {}
  var sponsors_bar = []
  var sponsors_bar_formatted = {}
  var sponsors_result = {}
  let sponsors_pie = []
  // Get Sponsors data from airtable
  function getSponsorsChartsData() {
    console.log("getSponsorsChartsData")
    return new Promise((resolve, reject) => {
      base('Studies').select({

          filterByFormula: airtableFilters,
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {



          records.forEach(function(record) {
            let condition = record.get('Conditions')
            for (let i of condition){
              pie_collection(sponsor_types_dict, i)
            }

            // pie_collection(sponsors_dict, record.get('Sponsor'))


          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }

          pie_formatting(sponsor_types_dict, sponsors_pie)
          // var items = Object.keys(sponsors_dict).map(function(key) {
          //   return [key, sponsors_dict[key]];
          // });
          //
          // // Sort the array based on the second element
          // items.sort(function(first, second) {
          //   return second[1] - first[1];
          // });
          //
          // var updated_sponsors_dict = {}
          // for (var item of items.slice(0, 10)){
          //   updated_sponsors_dict[item[0]] = item[1]
          // }

          // console.log("bar original: ", countries_bar_formatted)
          //bar_formatting(updated_sponsors_dict, sponsors_bar, sponsors_bar_formatted, "sponsor")
        //  bar_formatting(sponsors_dict, sponsors_bar, sponsors_bar_formatted, "sponsor")
          // sponsors_result["sponsors_bar"] = sponsors_bar_formatted
          sponsors_result["sponsors_pie"] = sponsors_pie
          //console.log("SPONSOR data: ", sponsors_bar_formatted)

          resolve(sponsors_result)

      })
    })
}// end of get trialStatusPieChartData




  const fetchSponsorsData = async () => {
    //console.log("fetchSponsorsData")
        const result = await getSponsorsChartsData()

        // setSponsorsTop10ByTrialsBarChartData(result.sponsors_bar);
        setSponsorTypePieChartData(result.sponsors_pie)
        // setSponsorsTop10ByEnrollmentBarChartData(result.data.sponsors_top_10_by_enrollment);
        //setSponsorsBreakdownChartData(result.data.sponsors_breakdown);

        setLoadingSponsorsData(false)
      }

      let geography = {}
      let geography_result = []
      let geography_country_dict = {}
      let regions_dict = {}
      let regions_pie = []
      let countries_bar = []
      let countries_bar_formatted = {}


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
        //console.log("getGeographyData")
        return new Promise((resolve, reject) => {
          base('Studies').select({
              // Selecting the first 3 records in Raw View:
              filterByFormula: airtableFilters,
              view: "Grid view"
          }).eachPage(function page(records, fetchNextPage) {
              // This function (`page`) will get called for each page of records.


              records.forEach(function(record) {
                // countries_list.push(record.get('Geography_Countries'))

                var country = record.get('Location')
                //console.log("country: ", country, typeof(country))
                // if (country.chartAt(0)===" "){
                //   console.log("COUNT: ", country)
                //   country = country.slice(1, country.length)
                // }
                //var trial_NCT = record.get('NCT')
                if (country === "Czechia") {
                  pie_collection(geography_country_dict, "CZE")
                } else if (country === "Various"){
                  pie_collection(geography_country_dict, "Various")
                } else if (country.includes("USA")){
                  pie_collection(geography_country_dict, "USA")
                } else if (country.includes("Taiwan")){
                  pie_collection(geography_country_dict, "TWN")
                } else if (country==="NR"){
                  pie_collection(geography_country_dict, "NR")
                } else if (country.includes("Singapore")){
                  pie_collection(geography_country_dict, "SGP")
                } else {
                  var code = cc.nameIncludes(country)[0].alpha3
                  pie_collection(geography_country_dict, code)

                }
                // let region = record.get('Geography_Regions')
                // if (typeof(region)==='object'){
                //   for (let i of region){
                //     pie_collection(regions_dict, i)
                //   }
                // } else {
                //   pie_collection(regions_dict, region)
                // }
                // for (var item of country){
                //   // this if statement is just because the library isn't able to convert it
                //   if (item === "Czechia") {
                //     pie_collection(geography_country_dict, "CZE")
                //   } else {
                //     var code = cc.nameIncludes(item)[0].alpha3
                //     pie_collection(geography_country_dict, code)
                //
                //   }
                // }
                // if (typeof(country)==='object'){
                //
                // }

              });

              fetchNextPage();

          }, function done(err) {
              if (err) {
                console.error(err);
                return reject({});
              }

            //  pie_formatting(regions_dict, regions_pie)
              geog_formatting(geography_country_dict, geography_result)
              console.log("Geography!!: ", geography_result)
              // var items = Object.keys(geography_country_dict).map(function(key) {
              //   return [key, geography_country_dict[key]];
              // });
              //
              // // Sort the array based on the second element
              // items.sort(function(first, second) {
              //   return second[1] - first[1];
              // });
              //
              // var updated_countries_dict = {}
              // for (var item of items.slice(0, 10)){
              //   updated_countries_dict[item[0]] = item[1]
              // }

              // console.log("bar original: ", countries_bar_formatted)
              //bar_formatting(updated_countries_dict, countries_bar, countries_bar_formatted, "country")
              //console.log("bar: ", countries_bar_formatted)
            //  geography["countries_bar"] = countries_bar_formatted
              //geography["regions_pie"] = regions_pie
              geography["map"] = geography_result
              resolve(geography)

          })
        })
    }// end of get geographyData


  const fetchGeographyData = async () => {
    // console.log("fetchGeographyData")
    const result = await getGeographyData()
    setGeographyFacilitiesChartData(result.map);
    // setRegionsPieChartData(result.regions_pie)
    // setCountriesTop10BarChartData(result.countries_bar)
    //console.log("BAR: ", result.countries_bar)

    setLoadingGeographyData(false)
  }

  useEffect(() => {
    if (initialFilterLoadComplete) {
      setLoadingActivityTypesData(true);
      fetchActivityTypesData();
    }

  }, [updateRequested, initialFilterLoadComplete])


  useEffect(() => {
    if (initialFilterLoadComplete) {
      setLoadingStatsData(true)
      fetchSingleStatMetrics();

      setLoadingTrialsLandscapeData(true);
      fetchTrialsMetricData();
      setLoadingInterventionsData(true);
      fetchInterventionsData();

      setLoadingSponsorsData(true);
      fetchSponsorsData();

      setLoadingOutcomesData(true);
      fetchOutcomesData();


      setLoadingTrialsLandscapeData(true)
      fetchTrialsLandscapeChartData();
      setLoadingPopulationsLandscapeData(true)
      fetchPopulationsLandscapeChartData();
      setLoadingInterventionsLandscapeData(true)
      fetchInterventionsLandscapeChartData();
      setLoadingOutcomesLandscapeData(true)
      fetchOutcomesLandscapeChartData();
      fetchAllTableData();

      setLoadingGeographyData(true);
      fetchGeographyData();

    }
    // eslint-disable-next-line
  }, [updateRequested, initialFilterLoadComplete])
  // [updateRequested, initialFilterLoadComplete])


  // if (currentUser === undefined) {
  //   return <Redirect to="/login" />
  // }



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
        case 'Studies':
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

        case 'Conditions':
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
        case 'Studies':
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
        case 'Conditions':
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
    'Studies': 'red',
    'Populations': 'orange',
    'Interventions': 'yellow',
    'Outcomes': 'green',
    'Conditions': 'blue',
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
          <div className="scrollable-container">
          <Row className="title-block">
          <Col>
            <PrismTextBlock
              textTitle={'Music in the Treatment and Management of Serious Mental Illness: A Global Scoping Review of the Literature' }
              />
          </Col>
          </Row>
            <Row className="d-none d-xl-block">
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
                    <PrismTextBlock
                      textTitle={ 'How to use this landscape' }
                      mainText={ 'This page provides a dynamic lens for viewing the evidence for effects of music and music-based activities on serious mental illness. These effects are wide-ranging and involve many types of activities, populations, outcomes, and study designs. The numbers at the top of the page describe the overall quantity of evidence that is summarized by the visuals you’ll see below.' }
                      moreText={"On the left side of the page are set of data filters. These can be used to focus on specific subsets of the evidence, such as specific populations or conditions."}
                    />
                  </Col>
                  </Row>
                  <Row>
                    <Col>
                      <SectionTitle title="Studies" color="red" />
                    </Col>
                  </Row>
                  <Row>
                  <Col lg={{span: 6}}>
                    <PrismPieChart
                      colors="rainbow"
                      title="What types of studies are included in the analysis?"
                      chartData={trialPurposePieChartData}
                      loading={loadingTrialsData}
                    />
                  </Col>
                  <Col lg={{span: 6}}>

                    <PrismTextBlock
                      paddingTop={90}
                      paddingBottom={0}
                      arrow={<FaArrowCircleLeft/ >}
                      textTitle={ '     Lorem Ipsum?' }
                      mainText={ "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }
                    />
                  </Col>
                  </Row>
                  <Row>
                  <Col lg={{span: 6}}>
                    <PrismPieChart
                      colors="rainbow"
                      title="What is the distribution of study results?"
                      chartData={trialStatusPieChartData}
                      loading={loadingTrialsData}
                    />
                  </Col>
                  <Col lg={{span: 6}}>
                    <PrismTextBlock
                      paddingTop={120}
                      paddingBottom={0}
                      arrow={<FaArrowCircleLeft/ >}
                      textTitle={ '     How did we classify results?' }
                      mainText={ "Due to the wide variety of study facets involved in this scoping review, results were classified according to whether the music intervention was found to have performed better, worse, equivalent to the comparator, or whether results were undetermined." }
                    />
                  </Col>
                  </Row>
                  <Row>
                  <Col>
                    <PrismStaticScatterplot
                      title="How has research activity for these conditions changed over time?"
                      colors="rainbow"
                      chartData={trialsLandscapeChartData}
                      chartHeight={900}
                      marginBottom={100}
                      type={'time'}
                      format={'%Y'}
                      tickValues={trialsLandscapeXs}
                      axisBottomFormat={'%Y'}
                      minNodeSize={trialsLandscapeMinNodeSize}
                      maxNodeSize={trialsLandscapeMaxNodeSize}
                      xAxisLabel={"Start Date"}
                      yAxisLabel={"Condition"}
                      zAxisLabel={"Sample Size"}
                      loading={loadingTrialsLandscapeData}
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
                    <PrismPieChart
                      colors="yellow"
                      title="What is the distribution of intervention types?"
                      chartData={interventionTypesPieChartData}
                      loading={loadingInterventionsData}
                    />
                  </Col>
                  <Row>
                  <Col>

                    <PrismTextBlock
                      paddingTop={90}
                      paddingBottom={0}
                      arrow={<FaArrowCircleDown/ >}
                      textTitle={ '     How did we classify interventions?' }
                      mainText={ "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }
                    />
                  </Col>
                  </Row>


                  </Row>
                  <Row>
                  <Col>
                    <PrismBarChart
                      color="orange"
                      layout="vertical"
                      title="Interventions"
                      chartHeight={600}
                      chartData={interventionsBarData.data}
                      groupKeys={interventionsBarData.group_keys}
                      indexKey="type"
                      xAxisLabel=""
                      yAxisLabel=""
                      groupMode={'stacked'}
                      marginBottom={170}
                      loading={loadingInterventionsData}
                    />
                  </Col>
                  </Row>
                  <Row>
                  <Col>
                    <PrismBarChart
                      color="yellow"
                      layout="vertical"
                      title="Comparators"
                      chartData={comparatorsBarData.data}
                      groupKeys={comparatorsBarData.group_keys}
                      indexKey="type"
                      xAxisLabel=""
                      yAxisLabel=""
                      groupMode={'stacked'}
                      marginBottom={190}
                      loading={loadingInterventionsData}
                    />
                  </Col>
                  </Row>

                  <Row>
                  <Col>
                    <PrismStaticScatterplot
                      title="What Have Music-Based Activities Been Compared To?"
                      colors="rainbow"
                      chartData={populationsLandscapeChartData}
                      chartHeight={900}
                      marginBottom={90}
                      type={"point"}
                      minNodeSize={populationsLandscapeMinNodeSize}
                      maxNodeSize={populationsLandscapeMaxNodeSize}
                      xAxisLabel={"Condition"}
                      yAxisLabel={"Comparator"}
                      zAxisLabel={"Sample Size"}
                      loading={loadingPopulationsLandscapeData}
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
                      layout="vertical"
                      title="Outcomes"
                      chartData={outcomesBarData.data}
                      groupKeys={outcomesBarData.group_keys}
                      indexKey="type"
                      xAxisLabel=""
                      yAxisLabel=""
                      groupMode={'stacked'}
                      marginBottom={130}
                      loading={loadingActivityTypesData}
                    />
                  </Col>
                  </Row>

                  <Row>
                  <Col>
                    <PrismStaticScatterplot
                      title="What Outcomes Have Been Used to Evaluate These Interventions?"
                      colors="rainbow"
                      chartData={interventionsLandscapeChartData}
                      chartHeight={900}
                      marginBottom={135}
                      type={"point"}
                      minNodeSize={interventionsLandscapeMinNodeSize}
                      maxNodeSize={interventionsLandscapeMaxNodeSize}
                      xAxisLabel={"Outcomes"}
                      yAxisLabel={"Interventions"}
                      zAxisLabel={"Sample Size"}
                      loading={loadingInterventionsLandscapeData}
                    />
                  </Col>
                  </Row>



                  <Row>
                    <Col>
                      <SectionTitle title="Conditions" color="blue" />
                    </Col>
                  </Row>
                  <Row>
                  <Col lg={{span: 12}}>
                    <PrismPieChart
                      colors="blue"
                      title="What is the distribution of mental illnesses studied?"
                      chartData={sponsorTypePieChartData}
                      loading={loadingSponsorsData}
                    />
                  </Col>
                  </Row>
                  <Row>
                  <Col>
                    <PrismBarChart
                      colors="rainbow"
                      layout="vertical"
                      title="What is the breakdown of intervention types evaluated for each condition?"
                      chartData={activityBarChartData.data}
                      groupKeys={activityBarChartData.group_keys}
                      indexKey="type"
                      xAxisLabel=""
                      yAxisLabel=""
                      groupMode={'grouped'}
                      marginBottom={130}
                      loading={loadingSponsorsData}
                    />
                  </Col>
                  </Row>
                  <Row>
                  <Col>
                    <PrismStaticScatterplot
                      title="What Were the Results of These Studies, for Each Condition?"
                      colors="rainbow"
                      chartData={outcomesLandscapeChartData}
                      chartHeight={900}
                      marginBottom={130}
                      type={"point"}
                      minNodeSize={outcomesLandscapeMinNodeSize}
                      maxNodeSize={outcomesLandscapeMaxNodeSize}
                      xAxisLabel={"Condition"}
                      yAxisLabel={"Outcomes"}
                      zAxisLabel={"Sample Size"}
                      loading={loadingOutcomesLandscapeData}
                    />
                  </Col>
                  </Row>


                  <Row>
                  <Col lg={{span: 12}}>
                    <PrismTextBlock
                      textTitle={ 'How to interpret this graph' }
                      mainText={ "The bubbles in the scatterplot indicate the type of and volume of studies for each condition and year combination. You can hover your mouse over each bubble to see more information about the research activity in that disease/time. You can also click on a node to inspect or download the details of the specific study reports." }
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
                      height={600}
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
