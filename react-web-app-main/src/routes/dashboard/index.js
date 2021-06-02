import React, { useState, useEffect } from "react";
import { Redirect, withRouter } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap'


import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

import { FaArrowCircleLeft, FaArrowCircleDown } from 'react-icons/fa'

import Navbar from './components/navbar'
import SearchFilters from './components/search-filters'
import SingleStat from './components/single-stat'
import SectionTitle from './components/section-title'
import PrismPieChart from './components/pie-chart'
import PrismBarChart from './components/bar-chart'
import PrismStaticScatterplot from './components/scatterplot-static'
import PrismChoropleth from './components/choropleth'
import MainTable from './components/tabulator'
import PrismTextBlock from './components/text-block'



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
  

  const [airtableFilters, setAirtableFilters] = useState("")


  const [updateRequested, setUpdatedRequested] = useState("")
  // sets filters
  const onUpdateButtonClicked = (e) => {
    

    setUpdatedRequested(Date())
    closeSidebar()
    setAllDataLoaded(false)
    filterData()


  }
  ////////////////////////////////////////
  //          CONSTANTS SECTION         //
  ////////////////////////////////////////
  const all_filters = {
    "Studies": ['Design'],
    "Populations": ['Study_Pop_Stnd', 'Gender', 'Race_Eth'],
    "Interventions": ['Interventions', 'Activity_Type', 'Intervention_Type', 'Comparator'],
    "Outcomes": ['Outcomes'],
    "Conditions": ['Conditions'],
    "Geography": ['Location']
  }

  const filters_adjusted_names_vals = {
    
    "Design": "Design",
    "Study_Pop_Stnd": "Broad Categories",
    "Gender": "Gender",
    "Race_Eth": "Race/Ethnicity",
    "Interventions": "Interventions",
    "Activity_Type": "Activity Type",
    "Intervention_Type": "Intervention Type",
    "Comparator": "Comparator",
    "Outcomes": "Outcomes",
    "Conditions": "Conditions",
    "Location": "Location"

    
  }

  const [trialsFilters, setTrialsFilters] = useState({})
  const [populationFilters, setPopulationFilters] = useState({})
  const [interventionsFilters, setInterventionsFilters] = useState({})
  const [outcomesFilters, setOutcomesFilters] = useState({})
  const [conditionsFilters, setConditionsFilters] = useState({})
  const [geographyFilters, setGeographyFilters] = useState({})
  const [initialFilterLoadComplete, setInitialFilterLoadComplete] = useState(false)

  // AIRTABLE ACCESS
  var Airtable = require('airtable');
  var base = new Airtable({apiKey: 'key8POUQgTG9Ubm4J'}).base('appE1OLuKp1Aq9dRl');
  

  //////////////////////////////////////////
 //          HELPER FUNCTIONS            //
//////////////////////////////////////////
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

  // COUNT RECORDS
  function countRecords(dictionary, key, record){
    if (Object.keys(dictionary).indexOf(key)<0){
      dictionary[key] = [record]
      //console.log("dictionary: ", dictionary)
    } else if (dictionary[key].indexOf(record)<0){
      dictionary[key].push(record)
    }
  }

  /*
  This function creates a dictionary where the key is and items name and the value
  is the occurences of that key
  */
  function countOccurrences(dictionary, key){
    if(key in dictionary){
      dictionary[key]+=1;
    } else {
      dictionary[key] = 1
    }
  }

  // Function to collect all the years in a range when dealing with a 
  function getAllYears(years_list){
    let min = Math.min(...years_list)
    let max = Math.max(...years_list)
    let all_years = []
    // console.log("MIN: ", min)
    for(let i=min; i<=max; i++){
      // console.log("I check: ", i)
      all_years.push(i)
    }
    //console.log("all years: ", all_years)
    return all_years
  }

  // Get a dictionary key by it's value
  function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

 


  

  

  


function newgetfilters(allTableData){
  var result = {}
  for (var filter_header of Object.keys(all_filters)){
    // a filter header will be the big title i.e. Trials or Geography
    // want to create a dictionary for each of these
    //console.log("header: ", filter_header)
    var mainfilters = {}
    // the subfilter will be like Type or Age Group or Status
  //console.log("allfilters - filter header: ", all_filters[filter_header])

    for (var subfilter of all_filters[filter_header]) {
      //console.log("SUBFIlter  ", subfilter)
      // create a set for the subfilter to get the unique ones

      var unique_subfilters = {}
      var subfilter_set = new Set()
      // now we need to go through the alltabledata and get the values that of the subfilter key

      for (var item of allTableData){
        //console.log("CHECK ITem: ", item)

        Object.keys(item).forEach(key => {
          //console.log("key: ", key, subfilter)
          if (key === subfilter){
            //console.log("key: ", key, item[key])
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
      console.log("SUBFILTER: ", subfilter)
      mainfilters[filters_adjusted_names_vals[subfilter]] = unique_subfilters
      //console.log("unique Subfilters: ", unique_subfilters)
      //console.log("subfilter set: ", subfilter_set)

    }
    result[filter_header] = mainfilters

  }
  console.log("FILTERS FROM NEW: ", result)
  return result
}

  

  //////////////////////////////////////////
 //    CHART CREATION FUNCTIONS          //
//////////////////////////////////////////
  
  // CREATE PIE CHART
   function createPieChart(airtableName, data){
    let pie_obj = {}
    let records_obj = {}
    for (var record of data){
      let value = record[airtableName]
      // console.log("typeof(value): ", typeof (value))
      if (typeof(value)==="object"){
        for (let v of value) {
          if (v !== "") {
            countOccurrences(pie_obj, v)
            countRecords(records_obj, v, record)
          }
        }
      } else if (value !== "" && typeof(value) !== 'undefined'){
        for (let v of value.split(",")) {
          countOccurrences(pie_obj, v, record)
          countRecords(records_obj, v, record)
        }
      }

    }
    let pie = [];
    pie_formatting(pie_obj, pie);
    // console.log("PIE: ", pie)
    // console.log("RECORDS: ", records_obj)
    for (let item of pie){
      let key = item.id
      item["key"] = records_obj[key]

    }
    // pie[]
    return pie
  }

  // CREATE BAR CHART 
  function createBarChart(airtableName, numBars, indexKey, sorter, data){
    let bar_obj = {};
    let record_obj = {}
    //console.log("DATA: ", data)
    //console.log("other items: ", airtableName, numBars, indexKey)
    for (var record of data){
      //console.log("REcod: ", record)
      let value = record[airtableName]

      if (typeof(value)==='object' && value.length > 0){
        for (var item of value){
          //console.log("value O?BJ: ", value)
          if (item !== null){
            var itemlist = item.split(", ")
            for (var j of itemlist){
              countOccurrences(bar_obj, j)
              countRecords(record_obj, j, record)
            }
          }
        }
      } else {
        if (typeof (value) !== 'undefined' && typeof(value)!=="number" && value.length > 0){
          // console.log("VALUE: ", value)
          let all = value.split(",")
          //console.log("value: ", all)
          for (let i of all){
            if (i.charAt(0)===" "){
              i = i.slice(1, i.length)
            }
            countOccurrences(bar_obj, i)
            countRecords(record_obj, i, record)
          }
        } else if (typeof (value) !== 'undefined' && value.length > 0) {
          countOccurrences(bar_obj, value)
          countRecords(record_obj, value, record)
        }
      }
    }


    var keys = Object.keys(bar_obj).map(function(key){
      return [key, bar_obj[key]];
    });
    // console.log("BARS KEYS: ", keys)

    let updated_bars = {};
    if (sorter==="value"){

      keys.sort(function(first, second){
        return second[1] - first[1];
      })

    } else if (sorter==="alphabetical") {
      keys.sort(function(first, second){
        return second[0] - first[0];
      })
      // for (var i of keys){
      //   updated_bars[i[0]] = i[1]
      // }
    } else if (typeof(sorter)==="object"){
      // need to log this and see
      let ordered_list = []
     // console.log("OBJECT SORTER: ", sorter)
      for (let item of sorter){
        for (let key of keys){
          //console.log("key, item: ", key, item)
          if (key[0]===item){
            ordered_list.push(key)
          }
        }
      }
      keys = ordered_list
      //console.log("Ordered List: ", ordered_list)
    }
    for (var i of keys.slice(0, numBars)){
      updated_bars[i[0]] = i[1]
    }


    let bar_formatted = {};

    bar_formatting(updated_bars, [], bar_formatted, indexKey, sorter)

    for (let item of bar_formatted.data){
      let key = Object.keys(item)[1]
      item["key"] = record_obj[key]

    }

    bar_formatted["formatted_data"] = record_obj
    console.log("Bar formatted: ", bar_formatted)
    return bar_formatted
  }

  // CREATE SCATTER PLOT
  function createScatterPlot(x_axis, y_axis, color, size, data) {

    let data_list = []
    let uni = new Set()
    let all_ys = new Set()
    let all = []
    let all_ids = new Set()
    let all_xs = new Set()

    for (let record of data){
      all.push(record)
      let status = record[color]
      all_ids.add(status)

      let x_list = (String(record[x_axis])).split(",")
      //console.log("X_LISt; ", x_list)
      // all_xs.add(x_list)
      let y_list = (String(record[y_axis])).split(",")


      let z = 1


      let clickId = []
      // console.log(record.get('Covidence_ID'))
      clickId.push(String(record['Covidence_ID']))
      // console.log("CLICKID: ", clickId)



      // need to do each y with each x
      for (var y of y_list) {
        //console.log("y: ", y)
        if (y !== "" && typeof(y)!=="undefined") {
          
          if (y.charAt(0) === " "){
            y = y.slice(1, y.length)
          }
          for (var x of x_list) {
            //console.log("x: ", x)
            if (x !== "" && typeof(x) !== "undefined") {
              all_xs.add(parseInt(x))
              data_list.push([status, x, y, z, clickId[0]])
              let as_string = status + "; " + x + "; " + y
              //  console.log("as string: ", as_string)
              uni.add(as_string)
            }
          }
          all_ys.add(y)
        }
      }
    } // we've gone through all the data

    let new_data_list = []
    let clean_data = {}
    let zs = []



    //console.log("Ys: ", ys)
    for (var i of uni) {

      var ids = i.split("; ")
      let z = 0;
      let clickids = new Set()


      for (var arr of data_list) {

        if (ids[0] === arr[0] && ids[1] === arr[1] && ids[2] === arr[2]) {
          z += arr[3]
          clickids.add(arr[4])

        }
      }

      let item = {}
      let limited = {}
      let list_ids = [...clickids]

      let list_all = [...all_ids]

      for (let status of list_all) {
        // console.log("status: ", status)
        let l1 = []
        for (let j of all) {
          // console.log("J: ", j)
          //  console.log("TYPE of : ", typeof(j.Design))
          if (typeof (j[color]) !== 'undefined' && typeof(j[x_axis]) !== 'undefined' && typeof(j[y_axis]) !== 'undefined') {
            // console.log(j[ytype], j.Design, j[xtype], status, ids[1], ids[2])
            //console.log("CHECK: ", typeof(j[xtype]), typeof(ids[1]))
            //console.log("ERORR HERE: ", (j[x_axis]), j[y_axis], j[color])
            if ((j[x_axis])===(ids[1]) && (j[y_axis]).includes(ids[2]) && (j[color]).includes(status)) {
              l1.push(j)
              //console.log("JJJ")
            }
            //console.log("l1: ", l1)
          }
        }
        //  console.log("L1: ", l1)
        if (l1.length !== 0) {
          limited[status] = l1
          // limited.push(l1)
        }


      }
      //console.log("LIMITED: ", limited)
      //console.log("ids[1]: ", ids[1], typeof(ids[1]))

      item[ids[0]] = { "x": ids[1], "y": ids[2], "z": z, "clickId": list_ids, "all": limited, "xtype": x_axis, "ytype": y_axis }

      new_data_list.push(item)
    }

    console.log("new LIST: ", new_data_list)

    for (var j of new_data_list) {
      let stat = Object.keys(j)[0]
      let val = Object.values(j)

      if (isNaN(val[0]["z"])) {
        val[0]["z"] = 0
      }
      zs.push(val[0]["z"])
      // console.log("val: ", val[0]["z"])
      if (stat in clean_data) {
        clean_data[stat].push(val[0])
      } else {
        clean_data[stat] = val
      }
    }
    //console.log("zs: ", zs)
    let all_years = getAllYears([...all_xs])
    console.log("All years: ", all_years)

    console.log("clean data: ", clean_data)
    var all_data = []
    for (var item of Object.keys(clean_data)) {
      // cleaned[data] = []
      for (let year of all_years){
        console.log("HERE: ", clean_data[item])
        let newdict = {}
        newdict["x"] = String(year)
        newdict["y"] = "Massachusetts General Hospital"
        newdict["all"] = {"": []}
        clean_data[item].push(newdict)

      }
      
      clean_data[item].sort(function(first, second) {
        return first.x - second.x;
      });

      let cleaned = {}
      cleaned["id"] = item
      cleaned["data"] = clean_data[item]
      all_data.push(cleaned)
    }
    // setTrialsLandscapeChartHeight(ys.size * 50 + 300)
    let landscape_result = {}
    // console.log("CHECK THIS DATA: ", all_data)

    landscape_result["data"] = all_data
    landscape_result["max"] = Math.max(...zs)
    let filtered = zs.filter(item => item !== 0)
    //console.log("filtered: ", filtered)
    landscape_result["min"] = Math.min(...zs)
    // landscape_result["dates"] = dates
    //console.log("LANDscape RESul; ", landscape_result)

    return landscape_result


  } // end of scatter creation function

  

  const generateFiltersPostBody = () => {
    console.log("generateFiltersPostBody")

    return {
      "Studies": trialsFilters,
      "Populations": populationFilters,
      "Interventions": interventionsFilters,
      "Outcomes": outcomesFilters,
      "Conditions": conditionsFilters,
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


  
  const [trialsLandscapeChartData, setTrialsLandscapeChartData] = useState([])
  const [populationsLandscapeChartData, setPopulationsLandscapeChartData] = useState([])
  const [interventionsLandscapeChartData, setInterventionsLandscapeChartData] = useState([])
  const [outcomesLandscapeChartData, setOutcomesLandscapeChartData] = useState([])
  const [sponsorsLandscapeChartData, setSponsorsLandscapeChartData] = useState([])

  

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

              var tabledata = {}
              
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

  const [totalData, setTotalData] = useState([])
  const [totalDataLoaded, setTotalDataLoaded] = useState(false)
  const [allData, setAllData] = useState([])
  const [allDataLoaded, setAllDataLoaded] = useState(false)
  const [columns, setColumns] = useState([])
  const fetchAllData = async () => {

      const res = await getTableData()
      const filts = newgetfilters(res.tabledata)
      setTrialsFilters(filts.Studies)
      setPopulationFilters(filts.Populations)
      setConditionsFilters(filts.Conditions)
      setGeographyFilters(filts.Geography)
      setOutcomesFilters(filts.Outcomes)
      setInterventionsFilters(filts.Interventions)
      

      setTotalData(res.tabledata)
      setTotalDataLoaded(true)
  }
    useEffect(() => {
      fetchAllData();
    }, [])

    const filterData = () => {

      console.log("TOTAL Data: ", totalData)
      let filts = generateFiltersPostBody()
      console.log("Generated: ", filts)
      let filter_true = {}
      for (let big_filter of Object.keys(filts)) {
        // big filter = studies
        console.log("big filter: ", big_filter)
        console.log("whats up with this: ", filts[big_filter])
        for (let subfilt of Object.keys(filts[big_filter])){
          //subfilt = Phase
          // then the value of phase is a dictionary
          console.log("SUBFILT: ", subfilt)
          let new_subfilt = getKeyByValue(filters_adjusted_names_vals, subfilt)
          console.log("new SUBFILT: ", new_subfilt)
          let true_list = []
          console.log(filts[big_filter][subfilt])
          for (let check of Object.keys(filts[big_filter][subfilt])){
            console.log("CHCEK: ", check)
            if (filts[big_filter][subfilt][check] === true){
              // console.log("Check: ", check)
              true_list.push(check)
            }
          }
          if (true_list.length!==0){
            filter_true[new_subfilt] = true_list
          }
        }
      }
      //console.log("filter true: ", filter_true)
      let newData = []
      for (let record of totalData){

        let all_bools = []
        for (let key of Object.keys(filter_true)){
          let keep_record = false
          //console.log("KEY: ", key)
          for (let i of filter_true[key]){
            //console.log("I: ", i)
            // if any in that category are in the record, we want to keep the record

            if (typeof(record[key])!=='undefined' && record[key].includes(i)){
              //console.log("record[key]: ", record[key], i)
              keep_record = true
            }

          }
          all_bools.push(keep_record)
        }

        //console.log("all bools: ", all_bools, )
        let isTrue = all_bools.every(function(e){
          return e === true
        })
        if (isTrue){
          newData.push(record)
        }
      }
      console.log("FILTERED DATA: ", newData)
      setAllData(newData)






      let cols = []
      for (let i of Object.keys(newData[0])){
        let obj = {}
        obj["title"] = i
        obj["field"] = i
        obj["hozAlign"] = "left"
        obj["width"] = 150
        // console.log("COLUMN OBJCET: ", obj)
        cols.push(obj)
      }
      setColumns(cols)
      //console.log("COLS: ", cols[0])
      //console.log("Is the data loading? ", newData)
      setAllDataLoaded(true)

      for (var record of newData){
        for (var key of Object.keys(record)){
          if (typeof(record[key]) !== "String" && typeof(record[key]) !== "undefined"){
            record[key] = record[key].toString()
          }
        }
      }
      setAllTableData(newData)
      setLoadingAllTableData(false)
    }


    useEffect(() => {
      if (totalDataLoaded) {
        filterData();
        //setAllDataLoaded(false)
      }

    }, [totalDataLoaded])
    




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
  function createChoropleth(data){
    let geog_dict = {}
    let records_obj = {}

    for (let record of data){
      let countries = (record["Location"]).split(",")
      // console.log("Countries: ", countries)
      for (let country of countries){
        //console.log("Country: ", country)
        if (country!=="" && typeof(country)!=='undefined'){
          if (country.charAt(0)===" "){
            country = country.slice(1, country.length)
          }
          let code = ""
          //console.log("country: ", country)
          if (country!=="Various" && country!=="NR"){
            //console.log("country: ", country)
            if (country==="USA"){
              code = "USA"
            } else {
              code = cc.nameIncludes(country)[0].alpha3
            }
          }
          

          countOccurrences(geog_dict, code)
          countRecords(records_obj, code, record)

        }
      }
    }
    let geog_result = []
    geog_formatting(geog_dict, geog_result)
    
    let geo_all = {}
    geo_all["data"] = geog_result
    geo_all["formatted_data"] = records_obj
    //console.log("geog all,: ", geo_all, geo_all.data)
    return geo_all
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
          setActiveParentFilterSections(conditionsFilters)
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
          setConditionsFilters(filters => updateFilters(filters, section, filter))
          setActiveParentFilterSections(filters => updateFilters(filters, section, filter))
          if ((filter || conditionsFilters[section][filter] === false) && shouldSelect === true){
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

  
  const [designPie, setDesignPie] = useState([])
  const [loadingDesignPie, setLoadingDesignPie] = useState(true)

  const [resultsPie, setResultsPie] = useState([])
  const [loadingResultsPie, setLoadingResultsPie] = useState(true)

  const [activitiesBar, setActivitiesBar] = useState({data: [], group_keys: []})
  const [loadingActivitiesBar, setLoadingActivitiesBar] = useState(true)

  const [activityTypePie, setActivityTypePie] = useState([])
  const [loadingActivityTypePie, setLoadingActivityTypePie] = useState(true)

  const [conditionsPie, setConditionsPie] = useState([])
  const [loadingConditionsPie, setLoadingConditionsPie] = useState(true)


  const [outcomesBar, setOutcomesBar] = useState({data: [], group_keys: []})
  const [loadingOutcomesBar, setLoadingOutcomesBar] = useState(true)

  const [comparatorsBar, setComparatorsBar] = useState({data: [], group_keys: []})
  const [loadingComparatorBars, setLoadingComparatorsBar] = useState(true)

  const [conditionsScatter, setConditionsScatter] = useState({data: [], min: 0, max: 1})
  const [loadingConditionsScatter, setLoadingConditionsScatter] = useState(true)

  const [interventionsScatter, setInterventionsScatter] = useState({data: [], min: 0, max: 1})
  const [loadingInterventionsScatter, setLoadingInterventionsScatter] = useState(true)

  const [choropleth, setChoropleth] = useState({data: [], formatted_data: []})
  const [loadingChoropleth, setLoadingChoropleth] = useState(true)


  useEffect(() => {
    if (allDataLoaded) {

      setDesignPie(createPieChart("Design", allData))
      setLoadingDesignPie(false)

      setResultsPie(createPieChart("Results", allData))
      setLoadingResultsPie(false)

      setActivitiesBar(createBarChart("Interventions", 100, "type", "value", allData))
      setLoadingActivitiesBar(false)

      setActivityTypePie(createPieChart("Activity_Type", allData))
      setLoadingActivityTypePie(false)

      setOutcomesBar(createBarChart("Outcomes", 100, "type", "value", allData))
      setLoadingOutcomesBar(false)

      setComparatorsBar(createBarChart("Comparator", 100, "type", "value", allData))
      setLoadingComparatorsBar(false)

      
      setConditionsScatter(createScatterPlot("Outcomes", "Conditions", "Results", "trials", allData))
      setLoadingConditionsScatter(false)

      setInterventionsScatter(createScatterPlot("Outcomes", "Interventions", "Results", "trials", allData))
      setLoadingInterventionsScatter(false)

      console.log("map: ", createChoropleth(allData))
      setChoropleth(createChoropleth(allData))
      setLoadingChoropleth(false)


     
      // here is where we'll call the chart creation functions 
  
    }
    
  }, [allDataLoaded])



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
                      moreText={"On the left side of the page are sets of data filters. These can be used to focus on specific subsets of the evidence, such as specific populations or conditions."}
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
                      title="What types of studies have been conducted?"
                      chartData={designPie}
                      loading={loadingDesignPie}
                      columns={columns}
                    />
                  </Col>
                  <Col lg={{span: 6}}>

                    <PrismTextBlock
                      paddingTop={90}
                      paddingBottom={0}
                      arrow={<FaArrowCircleLeft/ >}
                      textTitle={ '     How is music being studied?' }
                      mainText={ "In our full dataset, randomized Controlled Trials (RCTs) comprised the largest percentage of studies (23.2%), followed by Pre/Post Tests (21.8%) and Case Reports (18.3%). However, if you filter the data using the menus on the left, these proportions will change. But you can also hover over the graph to view more information." }
                    />
                  </Col>
                  </Row>
                  <Row>
                  <Col lg={{span: 6}}>
                    <PrismPieChart
                      colors="rainbow"
                      title="What were the study results? Hover over each color for information."
                      chartData={resultsPie}
                      loading={loadingResultsPie}
                      columns={columns}
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
                      marginBottom={130}
                      type={'time'}
                      format={'%Y'}
                      bottomOffset={80}
                      leftOffset={-170}
                      tickValues={trialsLandscapeXs}
                      axisBottomFormat={'%Y'}
                      minNodeSize={trialsLandscapeMinNodeSize}
                      maxNodeSize={trialsLandscapeMaxNodeSize}
                      xAxisLabel={"Start Year"}
                      yAxisLabel={"Condition"}
                      zAxisLabel={"Sample Size"}
                      loading={loadingTrialsLandscapeData}
                    />
                  </Col>
                  </Row>



                  <Row>
                    <Col>
                      <SectionTitle title="Interventions/Activities" color="orange" />
                    </Col>
                  </Row>

                  <Row>
                  <Col>
                    <PrismBarChart
                      color="orange"
                      layout="vertical"
                      title="What types of activities were involved in these studies?"
                      chartHeight={600}
                      chartData={activitiesBar.data}
                      groupKeys={activitiesBar.group_keys}
                      indexKey="type"
                      xAxisLabel=""
                      yAxisLabel='Number of Studies'
                      groupMode={'stacked'}
                      marginBottom={170}
                      loading={loadingActivitiesBar}
                      columns={columns}
                    />
                  </Col>
                  </Row>

                  <Row>
                  <Col lg={{span: 6}}>
                    <PrismPieChart
                      colors="orange"
                      title="Were these activities passive, active, or both?"
                      chartData={activityTypePie}
                      loading={loadingActivityTypePie}
                      columns={columns}
                    />
                  </Col>

                  <Col lg={{span: 6}}>

                    <PrismTextBlock
                      paddingTop={90}
                      paddingBottom={0}
                      arrow={<FaArrowCircleLeft/ >}
                      textTitle={ '     What do we mean by "Active" and "Passive"?' }
                      mainText={ "Levels of felt engagement can vary from participant to participant, but these terms allowed researchers to calculate how many music activities involved active engagement (e.g., playing an instrument) versus comparatively passive engagement (e.g., listening to music). The distinction is important, as previous studies have indicated that passive and active experiences can generate different changes via differing mechanisms." }
                    />
                  </Col>
                  </Row>

                  <Row>
                    <Col>
                      <SectionTitle title="Conditions" color="yellow" />
                    </Col>
                  </Row>
                  <Row>
                  <Col lg={{span: 12}}>
                    <PrismPieChart
                      colors="yellow"
                      title="What is the breakdown of mental illnesses studied?"
                      chartData={conditionsPie}
                      loading={loadingConditionsPie}
                      columns={columns}
                    />
                  </Col>
                  </Row>
                  <Row>
                  <Col>
                    <PrismBarChart
                      colors="rainbow"
                      layout="vertical"
                      title="What is the breakdown of activity types for each condition?"
                      chartData={activityBarChartData.data}
                      groupKeys={activityBarChartData.group_keys}
                      indexKey="type"
                      xAxisLabel=""
                      yAxisLabel=""
                      groupMode={'grouped'}
                      marginBottom={130}

                      loading={loadingActivitiesBar}
                      legend={[{
                        dataFrom: 'keys',
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 160,
                        translateY: -20,
                        itemsSpacing: 5,
                        itemWidth: 200,
                        itemHeight: 8,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 8,
                        effects: [{
                          on: 'hover',
                          style: {
                            itemOpacity: 1
                          }
                        }]
                      }]}
                      columns={columns}
                    />
                  </Col>
                  </Row>


                  <Row>
                  <Col>
                    <PrismStaticScatterplot
                      title="Below, you can see outcomes graphed according to condition. The bubbles in the graph indicate the type and number of studies for each condition and outcome combination. Study results are noted by color. You can hover your mouse over each bubble to see more information. You can also click on a node to view or even download the details of the specific study reports."
                      colors="rainbow"
                      chartData={conditionsScatter.data}
                      chartHeight={900}
                      marginBottom={130}
                      type={"point"}
                      minNodeSize={conditionsScatter.min}
                      maxNodeSize={conditionsScatter.max}
                      bottomOffset={124}
                      leftOffset={-170}
                      xAxisLabel={"Outcomes"}
                      yAxisLabel={"Conditions"}
                      zAxisLabel={"Sample Size"}
                      loading={loadingConditionsScatter}
                    />
                  </Col>
                  </Row>



                  <Row>
                    <Col>
                      <SectionTitle title="Outcomes" color="green" />
                    </Col>
                  </Row>

                  <Row>
                  <Col lg={{span: 6}}>
                    <PrismBarChart
                      color="green"
                      layout="vertical"
                      title="What kinds of outcomes were music-based interventions seeking to improve?"
                      chartData={outcomesBar.data}
                      groupKeys={outcomesBar.group_keys}
                      indexKey="type"
                      xAxisLabel=""
                      yAxisLabel=""
                      groupMode={'stacked'}
                      marginBottom={130}
                      loading={loadingOutcomesBar}
                      columns={columns}
                    />
                  </Col>

                  <Col lg={{span: 6}}>
                    <PrismTextBlock
                      paddingTop={130}
                      paddingBottom={0}
                      arrow={<FaArrowCircleLeft/ >}
                      textTitle={ '     What do we mean by "Outcomes"?' }

                      mainText={"       In research, the word ‘Outcomes’ refers to the variables that an intervention is designed to improve or change." }
                    />
                  </Col>
                  </Row>


                  <Row>
                  <Col>
                    <PrismStaticScatterplot
                      title="Let’s take a look at these outcomes according to each activity. Study results are noted by color."
                      colors="rainbow"
                      chartData={interventionsScatter.data}
                      chartHeight={900}
                      marginBottom={135}
                      type={"point"}
                      bottomOffset={124}
                      leftOffset={-205}
                      minNodeSize={interventionsScatter.min}
                      maxNodeSize={interventionsScatter.max}
                      xAxisLabel={"Outcomes"}
                      yAxisLabel={"Interventions"}
                      zAxisLabel={"Sample Size"}
                      loading={loadingInterventionsScatter}
                    />
                  </Col>
                  </Row>

                  <Row>
                    <Col>
                      <SectionTitle title="Comparators" color="blue" />
                    </Col>
                  </Row>

                  <Row>
                  <Col>
                    <PrismBarChart
                      color="blue"
                      layout="vertical"
                      title="What Have Music-Based Activities Been Compared To?"
                      chartData={comparatorsBar.data}
                      groupKeys={comparatorsBar.group_keys}
                      indexKey="type"
                      xAxisLabel=""
                      yAxisLabel=""
                      groupMode={'stacked'}
                      marginBottom={190}
                      loading={loadingComparatorBars}
                      columns={columns}
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
                        title="In what countries have these studies taken place?"
                        chartData={choropleth.data}
                        formattedData={choropleth.formatted_data}
                        loading={loadingChoropleth}
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
