import React, { useState, useEffect } from "react";
import { Redirect, withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap'
import axios from 'axios';
import { Auth } from 'aws-amplify';

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

import './index.css'




const initialStats = [
  {
    color: 'red',
    stats: [
      { title: 'Trials', metric: '--' },
      { title: 'Sites', metric: '--' },
      { title: 'Participants', metric: '--' }
    ]
  },
  {
    color: 'orange',
    stats: [
      { title: 'Technologies', metric: '--' },
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
      { title: 'Manufacturers', metric: '--' }
    ]
  },
  {
    color: 'indigo',
    stats: [
      { title: 'Sponsors', metric: '--' }
    ]
  },
  {
    color: 'violet',
    stats: [
      { title: 'Publications', metric:'--' }
    ]
  }
]


// setting the initial filters
// here we want to set each of the big numbers and sub numbers to empty
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
  Healthy_Volunteers: {},
  Single_Multi_Site: {},
  Enrollment_Target: {},
  Facility_Settings: {}
}

const initialInterventionsFilters = {
  // Drugs: {},
  // Devices: {},
  // Biological_Vaccines: {},
  // Procedures_Surgeries: {},
  // Radiation: {},
  // Behavioral: {},
  // Genetic: {},
  // Dietary_Supplements: {},
  // Combination_Products: {},
  // Diagnostic_Tests: {},
  // Other: {}
}

const initialOutcomesFilters = {
  // Clinical: {},
  // Safety: {},
  // Biological: {},
  // Pharmacological: {},
  // Survey_Questionnaire: {},
  // Other: {}
}


const initialSponsorsFilters = {
  // Academia: {},
  // Research_Hospital: {},
  // Industry: {},
  // Government: {},
  // Ngo: {},
  // Self_sponsored: {},
  // Healthcare_System: {},
  // Other: {}
}

const initialGeographyFilters = {
  Regions: {}
}

function DashboardRoute(props) {
  // console.log("whaT are prOPS: ", props)
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
  const onUpdateButtonClicked = (e) => {
    console.log(e)
    setUpdatedRequested(Date())
    closeSidebar()
    console.log("Filters?", generateFiltersPostBody())
    var filters_list = getAirtableFilters()
    var filts_final = formatFilersForAirtable(filters_list)

    setAirtableFilters(filts_final)

    // want to set the airtable filter here
  }

  function getAirtableFilters(){
    var filter_dict = generateFiltersPostBody()
    var store = []
    var sections = Object.keys(filter_dict)
    for (var section of sections){
      //console.log("sub_section (should be 'Populations' or 'Trials'): ", section)
      var section_keys = Object.keys(filter_dict[section])
      //var sub_section_vals = Object.values(filter_dict[section])
      for (var sub_section of section_keys){
        //console.log("key: (should be 'Phase' or 'status'): ", sub_section)
        //console.log("filter_dict[section][sub_section]: ", filter_dict[section][sub_section])
        var sub_section_keys = Object.keys(filter_dict[section][sub_section])
          for (var key of sub_section_keys){
            //console.log("key: ", key)
            if (filter_dict[section][sub_section][key] === false) {
              //console.log("key that is false: ", key)
              if (sub_section === "Type") {
                var new_dict = {"Study_Type": key}
                store.push(new_dict)
              } else if (sub_section === "Age Groups"){
                var new_dict = {"Age_Groups": key}
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
              } else if (sub_section === "Region"){
                var new_dict = {"Geography_Regions": key}
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
  function formatFilersForAirtable(filter_list){
    // basic string
    var openstr = "NOT(OR("
    var closestr = "))"

    var str = openstr

    for (var item of filter_list){
      var key = Object.keys(item)[0]
      var val = Object.values(item)[0]
      if (filter_list.indexOf(item) !== (filter_list.length-1)) {
        var substr = "{" + key + "} = '" + val + "', "
        str += substr
      } else {
        var substr = "{" + key + "} = '" + val + "'"
        str += substr
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

  var filters = "NOT(OR({Phase} = 'Phase 1'))"
  // see which filters are set to false
  // for each subset create a or filter
  // if something is unchecked, we want no trials with that attribute
  /*
  we want only sites with the items that are checked
  */
  // on update clicked
  // that's when we set filters


  var Airtable = require('airtable');
  var base = new Airtable({apiKey: API_KEY}).base(BASE_ID);
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
  // ****Looks like this is just one level? - check on this
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

  var unique_drugs = {};
  var unique_devices = {};
  var unique_drugs = {};
  var unique_biological = {};
  var unique_procedures = {};
  var unique_radiation = {};
  var unique_behavioral = {};
  var unique_genetic = {};
  var unique_dietarySupplements = {};
  var unique_combProds = {};
  var unique_diagnostic = {};
  var unique_otherInt = {};

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
            // this one will take more figuring out
            // var inter = record.get('Intervention_Types')
            // console.log("one intervention: ", inter.split(", "))
            var interventions = record.get('Intervention_Types').split(", ")
            for (var item of interventions){
              intervention_set.add(item)
            }



            // OUTCOMES FILTERS

            var outcome = record.get('Outcome_Concepts')
            if (typeof(outcome)==='object'){
              for (var item of outcome){
                if (item === null){
                  outcomes_set.add(null)
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
          //console.log("pahses: ", phases_set)


          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }
          //console.log("DID we ever make it here?")

          // TRIALS
          create_filter_dict(phases_set, unique_phases)
          create_filter_dict(status_set, unique_status)
          create_filter_dict(purpose_set, unique_purpose)
          create_filter_dict(type_set, unique_type)
          create_filter_dict(randomization_set, unique_random)
          create_filter_dict(masking_set, unique_masking)


          trials_filts["Type"] = unique_type;
          trials_filts["Status"] = unique_status;
          trials_filts["Purpose"] = unique_purpose;
          trials_filts["Randomization"] = unique_random;
          trials_filts["Masking"] = unique_masking;
          trials_filts["Phase"] = unique_phases;

          // POPULATIONS
          create_filter_dict(ageGroups_set, unique_ageGroups)
          create_filter_dict(healthyVolunteers_set, unique_healthyVolunteers)
          create_filter_dict(singleMultiSite_set, unique_singleMultiSite)
          create_filter_dict(targEnrollment_set, unique_targEnrollment)
          create_filter_dict(settings_set, unique_settings)


          populations_filts["Age Groups"] = unique_ageGroups;
          populations_filts["Healthy Volunteers"] = unique_healthyVolunteers;
          populations_filts["Single/Multi Site"] = unique_singleMultiSite;
          populations_filts["Target Enrollment"] = unique_targEnrollment;
          populations_filts["Settings"] = unique_settings;


          // INTERVENTIONS
          create_filter_dict(intervention_set, unique_interventions)
          interventions_filts["Interventions"] = unique_interventions


          // OUTCOMES
          create_filter_dict(outcomes_set, unique_outcomes)
          outcome_filts["Outcomes"] = unique_outcomes


          // SPONSORS

          create_filter_dict(sponsors_set, unique_sponsors)
          sponsor_filts["Sponsors"] = unique_sponsors


          // GEOGRAPHY

          for (var region of regions_list){
            var country_ind = regions_list.indexOf(region)
            //console.log("region is: ", region)
            if (typeof(region)==='object'){
              for (var i of region){
                //console.log("i is: ", i)
                var countries = countries_list[country_ind]

                if (typeof(countries)==='object'){
                  //console.log("countries: ", countries)

                  for (var country of countries){
                    //console.log("single country: ", country)
                  //  console.log("i check: ", i)
                    //console.log("KEYS: ", Object.keys(unique_regions))
                    if (Object.keys(unique_regions).indexOf(i)!==-1){
                    //  console.log("new i: ", i)
                      unique_regions[i][country] = true;
                    } else {
                      // var country = countries_list[country_ind]

                      unique_regions[i] = {[country]: true}
                    }
                  }
                }
              }
            }
          }


          geography_filts["Regions"] = unique_regions
          //console.log("UNIQUE regions: ", unique_regions)


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
    console.log("***FILTERS****: ", result)


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

  const [sidebarIsVisible, setSidebarIsVisible] = useState(false)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("")
  const [activeParentFilter, setActiveParentFilter] = useState("")
  const [activeParentFilterSections, setActiveParentFilterSections] = useState({})
  const [hoveredParentFilter, setHoveredParentFilter] = useState("")
  const [activeChildFilterSections, setActiveChildFilterSections] = useState({})

  const [stats, setStats] = useState(initialStats)

  const [trialStatusPieChartData, setTrialStatusPieChartData] = useState([])
  const [trialPurposePieChartData, setTrialPurposePieChartData] = useState([])
  const [trialTypePieChartData, setTrialTypePieChartData] = useState([])
  const [trialAgeGroupsPieChartData, setTrialAgeGroupsPieChartData] = useState([])
  const [cumulativeTrialsLineChartData, setCumulativeTrialsLineChartData] = useState([])

  const [landscapeChartData, setLandscapeChartData] = useState([])

  const [technologyComponentsPieChartData, setTechnologyComponentsPieChartData] = useState([])
  const [bodyLocationsComponentsPieChartData, setBodyLocationsComponentsPieChartData] = useState([])
  const [top10TechnologiesAsInterventionBarChartData, setTop10TechnologiesAsInterventionBarChartData] = useState({data: [], group_keys: []})
  const [top10TechnologiesAsOutcomesBarChartData, setTop10TechnologiesAsOutcomesBarChartData] = useState({data: [], group_keys: []})
  const [newTechnologiesPerYearBarChartData, setNewTechnologiesPerYearBarChartData] = useState({data: [], group_keys: []})

  const [conditionsTop10ParentBarChartData, setConditionsTop10ParentBarChartData] = useState({data: [], group_keys: []})
  const [conditionsTop10ChildBarChartData, setConditionsTop10ChildBarChartData] = useState({data: [], group_keys: []})
  const [conditionsBreakdownSunburstChartData, setConditionsBreakdownSunburstChartData] = useState([])

  const [measuresTop10BarChartData, setMeasuresTop10BarChartData] = useState({data: [], group_keys: []})
  const [measuresOverTimeLineChart, setMeasuresOverTimeLineChart] = useState([])

  const [manufacturersTop10ByTrialsBarChartData, setManufacturersTop10ByTrialsBarChartData] = useState({data: [], group_keys: []})
  const [manufacturersTop10ByProductsBarChartData, setManufacturersTop10ByProductsBarChartData] = useState({data: [], group_keys: []})

  const [sponsorsTop10ByTrialsBarChartData, setSponsorsTop10ByTrialsBarChartData] = useState({data: [], group_keys: []})
  const [sponsorsTop10ByEnrollmentBarChartData, setSponsorsTop10ByEnrollmentBarChartData] = useState({data: [], group_keys: []})
  const [sponsorsBreakdownChartData, setSponsorsBreakdownChartData] = useState([])

  const [geographyFacilitiesChartData, setGeographyFacilitiesChartData] = useState([])

  const [loadingStatsData, setLoadingStatsData] = useState(true)
  const [loadingTrialsData, setLoadingTrialsData] = useState(true)
  const [loadingLandscapeData, setLoadingLandscapeData] = useState(true)
  const [loadingTechnologyData, setLoadingTechnologyData] = useState(true)
  const [loadingConditionsData, setLoadingConditionsData] = useState(true)
  const [loadingMeasuresData, setLoadingMeasuresData] = useState(true)
  const [loadingManufacturersData, setLoadingManufacturersData] = useState(true)
  const [loadingSponsorsData, setLoadingSponsorsData] = useState(true)
  const [loadingGeographyData, setLoadingGeographyData] = useState(true)

  function pie_collection(dictionary, key){
    if(key in dictionary){
      dictionary[key]+=1;
    } else {
      dictionary[key] = 1
    }
  }
  // var pie_data = []
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

  var single_metrics_result = {}
  var single_metric_trials = []
  var single_metric_participants = []
  var single_metric_sponsors = new Set()
  var single_metric_outcomes = new Set()
  var single_metric_interventions = []

  function sum(list1){
    const total = list1.reduce(
        (previousScore, currentScore, index)=>previousScore+currentScore,
        0);
        console.log(total);
      return total;
  }

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

          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }

          // console.log("is this broken: ", single_metric_sponsors.size)
          single_metrics_result["sites"] = 0;
          single_metrics_result["trials"] = sum(single_metric_trials);
          single_metrics_result["participants"] = sum(single_metric_participants);
          single_metrics_result["manufacturers"] = 0;
          single_metrics_result["sponsors"] = single_metric_sponsors.size;
          single_metrics_result["publications"] = 0;
          single_metrics_result["outcomes"] = single_metric_outcomes.size;
          single_metrics_result["technologies"] = 0;
          single_metrics_result["interventions"] = 0;

          resolve(single_metrics_result)

      })
    })
}// end of get trialStatusPieChartData



// console.log("what is generate filters post body returning: ", generateFiltersPostBody())
  const fetchSingleStatMetrics = async () => {

    const result = await getSingleMetrics()
    console.log("result for single metric: ", result)


    setStats([
      {
        color: 'red',
        stats: [
          { title: 'Trials', metric: result.trials },
          { title: 'Sites', metric: result.sites },
          { title: 'Participants', metric: result.participants }
        ]
      },
      {
        color: 'orange',
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
          { title: 'Countries', metric: result.manufacturers }
        ]
      },
      {
        color: 'indigo',
        stats: [
          { title: 'Sponsors', metric: result.sponsors }
        ]
      },
      {
        color: 'violet',
        stats: [
          { title: 'Publications', metric: result.publications }
        ]
      }
    ])
    setLoadingStatsData(false)
  }

  var age_groups_pie_dict = {}
  var age_groups_pie = [];
  var purpose_pie_dict = {}
  var purpose_pie = [];
  var type_pie_dict = {}
  var type_pie = [];
  var status_pie_dict = {}
  var status_pie = [];
  var trials_line_dict = {}
  var trials_line = [];
  var trials_line_formatted = {}
  var trials_result = {}
  function getTrialsChartsData() {

    return new Promise((resolve, reject) => {
      base('Trials').select({
          // Selecting the first 3 records in Raw View:
          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.


          records.forEach(function(record) {
            var age = record.get('Age_Groups')[0].split(", ")
            for (var item of age){
              //console.log("item: ", item)
              pie_collection(age_groups_pie_dict, item)
            }
            pie_collection(purpose_pie_dict, record.get('Purpose'))
            pie_collection(type_pie_dict, record.get('Study_Type'))
            pie_collection(status_pie_dict, record.get('Status'))
            pie_collection(trials_line_dict, record.get('Start_Year'))



          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }
          //console.log("age groups pre-list: ", age_groups_pie_dict)
          //console.log("purpose pre-list: ", purpose_pie_dict)
          //console.log("type pre-list: ", type_pie_dict)
          //console.log("status pre-list: ", status_pie_dict)

          pie_formatting(age_groups_pie_dict, age_groups_pie)
          pie_formatting(purpose_pie_dict, purpose_pie)
          pie_formatting(type_pie_dict, type_pie)
          pie_formatting(status_pie_dict, status_pie)
          line_formatting(trials_line_dict, trials_line, trials_line_formatted)


          trials_result["age_pie"] = age_groups_pie;
          trials_result["purpose_pie"] = purpose_pie;
          trials_result["type_pie"] = type_pie
          trials_result["status_pie"] = status_pie
          trials_result["trials_line"] = [trials_line_formatted]
          //console.log('RESULT OF PIE DATA IS; ', trials_result)
          // here is where we'll run pie formatting

          resolve(trials_result)

      })
    })
}// end of get trialStatusPieChartData

  const fetchTrialsMetricData = async () => {


    const result = await getTrialsChartsData();
    console.log("result: ", result)

    setTrialStatusPieChartData(result.status_pie);
    setTrialPurposePieChartData(result.purpose_pie);
    setTrialTypePieChartData(result.type_pie);
    setTrialAgeGroupsPieChartData(result.age_pie);
    setCumulativeTrialsLineChartData(result.trials_line);

    setLoadingTrialsData(false)
  }

  var single_multi_site_dict = {}
  var single_multi_site_pie = [];

  var population_result = {}
  function getPopulationsChartsData() {

    return new Promise((resolve, reject) => {
      base('Trials').select({
          // Selecting the first 3 records in Raw View:
          filterByFormula: airtableFilters,
          view: "Raw View"
      }).eachPage(function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.


          records.forEach(function(record) {

            pie_collection(single_multi_site_dict, record.get('Single_Multi_Site'))

          });

          fetchNextPage();

      }, function done(err) {
          if (err) {
            console.error(err);
            return reject({});
          }
          //console.log("age groups pre-list: ", age_groups_pie_dict)
          //console.log("purpose pre-list: ", purpose_pie_dict)
          //console.log("type pre-list: ", type_pie_dict)
          //console.log("status pre-list: ", status_pie_dict)

          pie_formatting(single_multi_site_dict, single_multi_site_pie)



          population_result["sites_pie"] = single_multi_site_pie;

          //console.log('RESULT OF PIE DATA IS; ', trials_result)
          // here is where we'll run pie formatting

          resolve(population_result)

      })
    })
}// end of get trialStatusPieChartData


  const fetchLandscapeChartData = async () => {
    console.log("generateFiltersPostBody inside fetch landscape data: ", generateFiltersPostBody())
    const result = await axios.post(
      'https://7x2xibe2wl.execute-api.us-east-1.amazonaws.com/metrics/landscape',
      {
        filters: generateFiltersPostBody(),
        x_axis: '',
        y_axis: '',
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    setLandscapeChartData(result.data);
    setLoadingLandscapeData(false)
  }

  const fetchTechnologyMetricData = async () => {
    // const result = await axios.post(
    //   'https://7x2xibe2wl.execute-api.us-east-1.amazonaws.com/metrics/technology',
    //   {
    //     filters: generateFiltersPostBody()
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    //   }
    // );
    const result = await getPopulationsChartsData()


    setTechnologyComponentsPieChartData(result.sites_pie);
    // setBodyLocationsComponentsPieChartData(result.data.technologies_body_locations_pie);
    // setTop10TechnologiesAsInterventionBarChartData(result.data.technologies_top_10_as_intervention_bar)
    // setTop10TechnologiesAsOutcomesBarChartData(result.data.technologies_top_10_as_outcomes_bar)
    // setNewTechnologiesPerYearBarChartData(result.data.technologies_new_technologies_per_year_bar)

    setLoadingTechnologyData(false)
  }

  const fetchConditionsMetricData = async () => {
    const result = await axios.post(
      'https://7x2xibe2wl.execute-api.us-east-1.amazonaws.com/metrics/conditions',
      {
        filters: generateFiltersPostBody()
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );


    setConditionsTop10ParentBarChartData(result.data.conditions_top_10_parents_bar);
    setConditionsTop10ChildBarChartData(result.data.conditions_top_10_children_bar);
    setConditionsBreakdownSunburstChartData(result.data.conditions_breakdown_sunburst)

    setLoadingConditionsData(false)
  }

  const fetchMeasuresMetricData = async () => {
    const result = await axios.post(
      'https://7x2xibe2wl.execute-api.us-east-1.amazonaws.com/metrics/measures',
      {
        filters: generateFiltersPostBody()
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    setMeasuresTop10BarChartData(result.data.measures_top_10_measures_bar);
    setMeasuresOverTimeLineChart(result.data.measures_over_time_line);

    setLoadingMeasuresData(false)
  }

  const fetchManufacturersData = async () => {
    const result = await axios.post(
      'https://7x2xibe2wl.execute-api.us-east-1.amazonaws.com/metrics/manufacturers',
      {
        filters: generateFiltersPostBody()
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    setManufacturersTop10ByTrialsBarChartData(result.data.manufacturers_top_10_by_trials);
    setManufacturersTop10ByProductsBarChartData(result.data.manufacturers_top_10_by_products);

    setLoadingManufacturersData(false)
  }

  const fetchSponsorsData = async () => {
        const result = await axios.post(
          'https://7x2xibe2wl.execute-api.us-east-1.amazonaws.com/metrics/sponsors',
          {
            filters: generateFiltersPostBody()
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        setSponsorsTop10ByTrialsBarChartData(result.data.sponsors_top_10_by_trials);
        setSponsorsTop10ByEnrollmentBarChartData(result.data.sponsors_top_10_by_enrollment);
        setSponsorsBreakdownChartData(result.data.sponsors_breakdown);

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
                //console.log("COUNTry: ", country)
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
      setLoadingLandscapeData(true)
      fetchLandscapeChartData();
      setLoadingTechnologyData(true)
      fetchTechnologyMetricData();
      setLoadingConditionsData(true)
      fetchConditionsMetricData();
      setLoadingMeasuresData(true)
      fetchMeasuresMetricData();
      setLoadingManufacturersData(true)
      fetchManufacturersData();
      setLoadingSponsorsData(true)
      fetchSponsorsData();
      setLoadingGeographyData(true)
      fetchGeographyData();
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

  // this is the extra piece for the layered side nav
  const onFilterHover = (filter) => {
    setHoveredParentFilter(filter)
    if (!activeParentFilter) {
      switch (activeCategoryFilter) {
        case 'Conditions':
          //setActiveChildFilterSections({[filter]: conditionsFilters['Children'][filter]})
          break;
        case 'Sponsors':
          // setActiveChildFilterSections({[filter]: sponsorsFilters['Children'][filter]})
          break;
        case 'Geography':
          // setActiveChildFilterSections({[filter]: geographyFilters['Children'][filter]})
          break;
        default:
          setActiveChildFilterSections({})
          break;
      }
    }
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
          // const conditionsParentFilterSections = { ...conditionsFilters};
          // delete conditionsParentFilterSections.Children
          // setActiveParentFilterSections(conditionsParentFilterSections)
          break;
        case 'Outcomes':
          setActiveParentFilterSections(outcomesFilters)
          break;

        case 'Sponsors':
          const sponsorParentFilterSections = { ...sponsorsFilters};
          delete sponsorParentFilterSections.Children
          setActiveParentFilterSections(sponsorParentFilterSections)
          break;
        case 'Geography':
          const geographyParentFilterSections = { ...geographyFilters};
          delete geographyParentFilterSections.Children
          setActiveParentFilterSections(geographyParentFilterSections)
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
    console.log("FILTER: ", filter)
    console.log("section: ", section)
    if (filter) {
      console.log('inside PFC and filter is: ', filter)
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
        case 'Outcomes':
            setOutcomesFilters(filters => updateFilters(filters, section, filter))
            setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
            if ((filter || outcomesFilters[section][filter] === false) && shouldSelect === true){
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

        case 'Sponsors':
          setSponsorsFilters(filters => updateFilters(filters, section, filter))
          setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
          if ((filter || sponsorsFilters[section][filter] === false) && shouldSelect === true){
            setActiveParentFilter(filter)
            setActiveChildFilterSections({[filter]: sponsorsFilters['Children'][filter]})
          }
          break;
        case 'Geography':
          setGeographyFilters(filters => updateFilters(filters, section, filter))
          setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
          if ((filter || geographyFilters[section][filter] === false) && shouldSelect === true){
            setActiveParentFilter(filter)
            setActiveChildFilterSections({[filter]: geographyFilters['Children'][filter]})
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
      switch (activeCategoryFilter) {
        case 'Conditions':
          //setActiveChildFilterSections({[filter]: conditionsFilters['Children'][filter]})
          break;
        case 'Sponsors':
          // setActiveChildFilterSections({[filter]: sponsorsFilters['Children'][filter]})
          break;
        case 'Geography':
          // setActiveChildFilterSections({[filter]: geographyFilters['Children'][filter]})
          break;
        default:
          setActiveChildFilterSections({})
          break;
      }
    }
  }

  const onChildFilterClicked = (section, filter) => {
    if (filter) {

      switch (activeCategoryFilter) {
        case 'Conditions':
          // setConditionsFilters(filters => updateChildFilters(filters, section, filter))
          // setActiveChildFilterSections(filters => updateFilters(filters, section, filter))
          break;
        case 'Sponsors':
          // setSponsorsFilters(filters => updateChildFilters(filters, section, filter))
          // setActiveChildFilterSections(filters => updateFilters(filters, section, filter))
          break;
        case 'Geography':
          // setGeographyFilters(filters => updateChildFilters(filters, section, filter))
          // setActiveChildFilterSections(filters => updateFilters(filters, section, filter))
          break;
        default:
          break;
      }
    }
  }

  const showDoubleSideBar = (activeParentFilter || hoveredParentFilter) && ['Conditions', 'Sponsors', 'Geography'].includes(activeCategoryFilter)

  const colors = {
    'Trials': 'red',
    'Populations': 'orange',
    'Interventions': 'yellow',
    'Outcomes': 'green',
    'Sponsors': 'blue',
    'Geography': 'indigo',
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
                        title="Trial Type"
                        chartData={trialTypePieChartData}
                        loading={loadingTrialsData}
                      />
                    </Col>
                    <Col lg={{span: 6}}>
                      <PrismPieChart
                        colors="rainbow"
                        title="Age Groups"
                        chartData={trialAgeGroupsPieChartData}
                        loading={loadingTrialsData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <PrismLineChart
                        colors="rainbow"
                        title="Cumulative Trials Over Time"
                        chartData={cumulativeTrialsLineChartData}
                        xAxisLabel="Year"
                        yAxisLabel="Trials"
                        showLegend={false}
                        loading={loadingTrialsData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <SectionTitle title="Outcomes" color="yellow" />
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={{span: 6}}>
                      <PrismBarChart
                        color="yellow"
                        layout="horizontal"
                        title="Disease Areas"
                        chartData={conditionsTop10ParentBarChartData.data}
                        groupKeys={conditionsTop10ParentBarChartData.group_keys}
                        indexKey="condition"
                        xAxisLabel="Trials"
                        yAxisLabel=""
                        loading={loadingConditionsData}
                      />
                    </Col>
                    <Col lg={{span: 6}}>
                      <PrismBarChart
                        color="yellow"
                        layout="horizontal"
                        title="Specific Diseases"
                        chartData={conditionsTop10ChildBarChartData.data}
                        groupKeys={conditionsTop10ChildBarChartData.group_keys}
                        indexKey="condition"
                        xAxisLabel="Trials"
                        yAxisLabel=""
                        loading={loadingConditionsData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <PrismSunburst
                        colors="rainbow"
                        title="Conditons Breakdown"
                        chartData={conditionsBreakdownSunburstChartData}
                        loading={loadingConditionsData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <SectionTitle title="Interventions" color="green" />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <PrismBarChart
                        color="green"
                        layout="horizontal"
                        title="Top 10 Measures"
                        chartData={measuresTop10BarChartData.data}
                        groupKeys={measuresTop10BarChartData.group_keys}
                        indexKey="measure"
                        xAxisLabel="Trials"
                        yAxisLabel=""
                        loading={loadingMeasuresData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <PrismLineChart
                        colors="rainbow"
                        title="Measure Use Over Time"
                        chartData={measuresOverTimeLineChart}
                        xAxisLabel="Year"
                        yAxisLabel=""
                        loading={loadingMeasuresData}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <SectionTitle title="Populations" color="blue" />
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={{span: 6}}>
                      <PrismPieChart
                        colors="rainbow"
                        title="Site Types"
                        chartData={technologyComponentsPieChartData}
                        loading={loadingTrialsData}
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
                  onFilterHover={onFilterHover}
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
