import React, { useState, useEffect } from "react";
import { Redirect, withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap'
// import axios from 'axios';
import { Auth } from 'aws-amplify';

import { ReactTabulator } from 'react-tabulator'
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

// import { AddBox, ArrowDownward } from "@material-ui/icons";
import MaterialTable from "material-table";
// import TableViewer from 'react-js-table-with-csv-dl';

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
// import TabulatorTable from './components/tabulator'

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


// setting the initial filters

const initialTrialFilters = {
  Status: {},
  Purpose: {},
  Type: {},
  Randomization: {},
  Masking: {},
  Phase: {}

}


const initialPopulationFilters = {
  Age_Groups: {},
  Enrollment_Target: {},
  Facility_Settings: {},
  Healthy_Volunteers: {},
  Single_Multi_Site: {}

}

const initialInterventionsFilters = {

}

const initialOutcomesFilters = {

}


const initialSponsorsFilters = {

}

const initialGeographyFilters = {
  Regions: {}
}

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
var filters = "NOT(OR({Phase} = 'Phase 1'))"
// formats the filter string to give airtable the filterbyformula
  function formatFiltersForAirtable(filter_list){
    // basic string
    var openstr = "NOT(OR("
    var closestr = "))"

    var str = openstr

    for (var item of filter_list){

      // Any fields that are lists of tags should go in this array to get filtered correctly
      var listFields = ['Geography_Countries','Age_Groups','Outcome_Concepts']

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

  const [trialsFilters, setTrialsFilters] = useState(initialTrialFilters)
  const [populationFilters, setPopulationFilters] = useState(initialPopulationFilters)
  const [interventionsFilters, setInterventionsFilters] = useState(initialInterventionsFilters)
  const [outcomesFilters, setOutcomesFilters] = useState(initialOutcomesFilters)
  const [sponsorsFilters, setSponsorsFilters] = useState(initialSponsorsFilters)
  const [geographyFilters, setGeographyFilters] = useState(initialGeographyFilters)
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

  var drugs_set = new Set();
  var devices_set = new Set();
  var drugs_set = new Set();
  var biological_set = new Set();
  var procedures_set = new Set();
  var radiation_set = new Set();
  var behavioral_set = new Set();
  var genetic_set = new Set();
  var dietarySupplements_set = new Set();
  var combProds_set = new Set();
  var diagnostic_set = new Set();
  var otherInt_set = new Set();

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

  // var unique_drugs = {};
  // var unique_devices = {};
  // var unique_drugs = {};
  // var unique_biological = {};
  // var unique_procedures = {};
  // var unique_radiation = {};
  // var unique_behavioral = {};
  // var unique_genetic = {};
  // var unique_dietarySupplements = {};
  // var unique_combProds = {};
  // var unique_diagnostic = {};
  // var unique_otherInt = {};

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




  // loading variables - set the loading icons until the data has fully loaded
  const [loadingStatsData, setLoadingStatsData] = useState(true)
  const [loadingTrialsData, setLoadingTrialsData] = useState(true)
  const [loadingPopulationData, setLoadingPopulationData] = useState(true)
  const [loadingInterventionsData, setLoadingInterventionsData] = useState(true)
  const [loadingOutcomesData, setLoadingOutcomesData] = useState(true)
  const [loadingSponsorsData, setLoadingSponsorsData] = useState(true)
  const [loadingGeographyData, setLoadingGeographyData] = useState(true)

  const [loadingAllTableData, setLoadingAllTableData] = useState(true)
  const [allTableData, setAllTableData] = useState([])

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

          // console.log("is this broken: ", single_metric_sponsors.size)
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
                var country = record.get('Geography_Countries')
                var trial_NCT = record.get('NCT')
                //console.log("NCT: ", trial_NCT, " Country: ", country)
              //  console.log("country 0: ", country[0])
                if (typeof(country)==='object'){
                  for (var item of country){
                    // console.log("iTEM: ", item)
                    if (item === "Argentina") {
                      pie_collection(geography_country_dict, "ARG")
                    } else if (item === "Australia") {
                      pie_collection(geography_country_dict, "AUS")
                    } else if (item === "Belgium") {
                      pie_collection(geography_country_dict, "BEL")
                    } else if (item === "Brazil") {
                      pie_collection(geography_country_dict, "BRA")
                    } else if (item === "Canada") {
                      pie_collection(geography_country_dict, "CAN")
                    } else if (item === "China") {
                      pie_collection(geography_country_dict, "CHN")
                    } else if (item === "Czechia") {
                      pie_collection(geography_country_dict, "CZE")
                    } else if (item === "Denmark") {
                      pie_collection(geography_country_dict, "DNK")
                    } else if (item === "Egypt") {
                      pie_collection(geography_country_dict, "EGY")
                    } else if (item === "Finland") {
                      pie_collection(geography_country_dict, "FIN")
                    } else if (item === "France") {
                      pie_collection(geography_country_dict, "FRA")
                    } else if (item === "Germany") {
                      pie_collection(geography_country_dict, "DEU")
                    } else if (item === "Greece") {
                      pie_collection(geography_country_dict, "GRC")
                    } else if (item === "Hong Kong") {
                      pie_collection(geography_country_dict, "HKG")
                    } else if (item === "Hungary") {
                      pie_collection(geography_country_dict, "HUN")
                    } else if (item === "Ireland") {
                      pie_collection(geography_country_dict, "IRL")
                    } else if (item === "Israel") {
                      pie_collection(geography_country_dict, "ISR")
                    } else if (item === "Italy") {
                      pie_collection(geography_country_dict, "ITA")
                    } else if (item === "Japan") {
                      pie_collection(geography_country_dict, "JPN")
                    } else if (item === "Mexico") {
                      pie_collection(geography_country_dict, "MEX")
                    } else if (item === "Netherlands") {
                      pie_collection(geography_country_dict, "NLD")
                    } else if (item === "Nigeria") {
                      pie_collection(geography_country_dict, "NGA")
                    } else if (item === "Norway") {
                      pie_collection(geography_country_dict, "NOR")
                    } else if (item === "Pakistan") {
                      pie_collection(geography_country_dict, "PAK")
                    } else if (item === "Poland") {
                      pie_collection(geography_country_dict, "POL")
                    } else if (item === "Portugal") {
                      pie_collection(geography_country_dict, "PRT")
                    } else if (item === "Romainia") {
                      pie_collection(geography_country_dict, "ROU")
                    } else if (item === "Singapore") {
                      pie_collection(geography_country_dict, "SGP")
                    } else if (item === "Slovakia") {
                      pie_collection(geography_country_dict, "SVK")
                    } else if (item === "South Korea") {
                      pie_collection(geography_country_dict, "KOR")
                    } else if (item === "Spain") {
                      pie_collection(geography_country_dict, "ESP")
                    } else if (item === "Sweden") {
                      pie_collection(geography_country_dict, "AR")
                    } else if (item === "Switzerland") {
                      pie_collection(geography_country_dict, "CHE")
                    } else if (item === "Taiwan") {
                      pie_collection(geography_country_dict, "TWN")
                    } else if (item === "Tanzania") {
                      pie_collection(geography_country_dict, "AR")
                    } else if (item === "Thailand") {
                      pie_collection(geography_country_dict, "THA")
                    } else if (item === "Turkey") {
                      pie_collection(geography_country_dict, "TZA")
                    } else if (item === "United Arab Emirates") {
                      pie_collection(geography_country_dict, "ARE")
                    } else if (item === "United Kingdom") {
                      pie_collection(geography_country_dict, "GBR")
                    } else if (item === "United States") {
                      pie_collection(geography_country_dict, "USA")
                    } else if (item === "Vietnam") {
                      pie_collection(geography_country_dict, "VNM")
                    }
                    //pie_collection(geography_country_dict, item)
                  }
                }

              });

              fetchNextPage();

          }, function done(err) {
              if (err) {
                console.error(err);
                return reject({});
              }

              //console.log("geog data; ", geography_country_dict)
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

  var tab_ind = 0
  var table_data = []
  function getTableData() {

    return new Promise((resolve, reject) => {
      base('Trials').select({

          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {

          records.forEach(function(record) {

            // console.log("Record: ", record)
            record.fields["id"] = tab_ind
            tab_ind = tab_ind + 1;
            table_data.push(record.fields)

          });
          fetchNextPage();
      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }
          var all_table = {}
          all_table["table_data"] = table_data

          resolve(all_table)
      })
    })
}// end of get trialStatusPieChartData




  const fetchTableData = async () => {
    const result = await getTableData()
    //console.log("RESULT of tabledata: ", result.table_data)
    setAllTableData(result.table_data)
    //console.log("all_table: ", allTableData)
    setLoadingAllTableData(false)

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
      fetchTableData();
      // console.log("What does fetchTrialsMetricData LOOK LIKE: ", fetchTrialsMetricData())
    }
    // eslint-disable-next-line
  }, [updateRequested, initialFilterLoadComplete])

  if (currentUser === undefined) {
    return <Redirect to="/login" />
  }

  // closes the sidebar when you click away
  const closeSidebar = () => {
    setSidebarIsVisible(false)
    setActiveCategoryFilter("")
    setActiveParentFilterSections({})
  }

  // // this is the extra piece for the layered side nav
  // const onFilterHover = (filter) => {
  //   setHoveredParentFilter(filter)
  //   if (!activeParentFilter) {
  //     switch (activeCategoryFilter) {
  //       case 'Conditions':
  //         //setActiveChildFilterSections({[filter]: conditionsFilters['Children'][filter]})
  //         break;
  //       case 'Sponsors':
  //         // setActiveChildFilterSections({[filter]: sponsorsFilters['Children'][filter]})
  //         break;
  //       case 'Geography':
  //         // setActiveChildFilterSections({[filter]: geographyFilters['Children'][filter]})
  //         break;
  //       default:
  //         setActiveChildFilterSections({})
  //         break;
  //     }
  //   }
  // }

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
    //console.log("FILTER: ", filter)
    //console.log("section: ", section)
    if (filter) {
      //console.log('inside PFC and filter is: ', filter)
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
      // switch (activeCategoryFilter) {
      //   case 'Conditions':
      //     //setActiveChildFilterSections({[filter]: conditionsFilters['Children'][filter]})
      //     break;
      //   case 'Sponsors':
      //     // setActiveChildFilterSections({[filter]: sponsorsFilters['Children'][filter]})
      //     break;
      //   case 'Geography':
      //     // setActiveChildFilterSections({[filter]: geographyFilters['Children'][filter]})
      //     break;
      //   default:
      //     setActiveChildFilterSections({})
      //     break;
      // }
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

  const columns = [
  { title: "Age Groups", field: "Age_Groups", width: 150 },
  { title: "Conditions", field: "Conditions", width: 150 },
  { title: "Countries", field: "Geography_Countries", width: 150  },
  { title: "Enrollment", field: "Enrollment", width: 150 },
  { title: "Enrollment Target", field: "Enrollment_Target", width: 150 },
  { title: "Settings", field: "Facility_Settings", width: 150 },
  { title: "Regions", field: "Geography_Regions", width: 150 },
  { title: "Intervention Types", field: "Intervention_Types", width: 150 },
  { title: "Interventions", field: "Interventions", width: 150 },
  { title: "NCT", field: "NCT", width: 150 },
  { title: "Outcomes", field: "Outcome_Concepts", width: 150 },
  { title: "Phase", field: "Phase", width: 150 },
  { title: "Purpose", field: "Purpose", width: 150 },
  { title: "Randomization", field: "Randomization", width: 150 },
  { title: "Single/Multi Site", field: "Single_Multi_Site", width: 150 },
  { title: "Sponsor", field: "Sponsor", width: 150 },
  { title: "Start Year", field: "Start_Year", width: 150 },
  { title: "Status", field: "Status", width: 150 },
  { title: "Study Type", field: "Study_Type", width: 150 },
  { title: "Title", field: "Title", width: 150 }
  ];

  const columns_download = [
  { displayName: "Age Groups", id: "Age_Groups"},
  { displayName: "Conditions", id: "Conditions"},
  { displayName: "Countries", id: "Geography_Countries"},
  { displayName: "Enrollment", id: "Enrollment"},
  { displayName: "Enrollment Target", id: "Enrollment_Target"},
  { displayName: "Settings", id: "Facility_Settings"},
  { displayName: "Regions", id: "Geography_Regions"},
  { displayName: "Intervention Types", id: "Intervention_Types"},
  { displayName: "Interventions", id: "Interventions"},
  { displayName: "NCT", id: "NCT"},
  { displayName: "Outcomes", id: "Outcome_Concepts"},
  { displayName: "Phase", id: "Phase"},
  { displayName: "Purpose", id: "Purpose"},
  { displayName: "Randomization", id: "Randomization"},
  { displayName: "Single/Multi Site", id: "Single_Multi_Site"},
  { displayName: "Sponsor", id: "Sponsor"},
  { displayName: "Start Year", id: "Start_Year"},
  { displayName: "Status", id: "Status"},
  { displayName: "Study Type", id: "Study_Type"},
  { displayName: "Title", id: "Title"}
  ];

//   var table = new ReactTabulator("#", {
//     height:"311px",
//     columns:columns,
//
// });
// console.log("TABLE; ", table)

  const options = {

      // height: "500px",
      width: "90%",
      // virtualDomBuffer:"1000px",
      layoutColumnsOnNewData:true,
      responsiveLayout:"hide",
      placeholder:"Data Loading...",
      layout:"fitData",

  };


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
                      <PrismBarChart
                        color="blue"
                        layout="vertical"
                        title="Sponsor Types"
                        chartData={sponsorsTop10ByTrialsBarChartData.data}
                        groupKeys={sponsorsTop10ByTrialsBarChartData.group_keys}
                        indexKey="sponsor"
                        xAxisLabel="Sponsor Type"
                        yAxisLabel=""
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
                        title="Site Volume"
                        chartData={geographyFacilitiesChartData}
                        loading={loadingGeographyData}
                      />
                    </Col>
                  </Row>
                  <CsvDownloader
                  filename="myfile"
                  datas={allTableData}
                  columns={columns_download}
                  text="DOWNLOAD" />
                  <ReactTabulator
                    data={allTableData}
                    columns={columns}
                    options={options}
                  />
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
