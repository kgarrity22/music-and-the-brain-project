
import React from "react";


import DateEditor from "react-tabulator/lib/editors/DateEditor";
import MultiValueFormatter from "react-tabulator/lib/formatters/MultiValueFormatter";
// import MultiSelectEditor from "react-tabulator/lib/editors/MultiSelectEditor";

import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css"; // use Theme(s)


import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

import { ReactTabulator } from 'react-tabulator'


let data = [];




function getTableData(){
      var Airtable = require('airtable');
      var base = new Airtable({apiKey: 'keygbNFWvzaP9t8xi'}).base('appmh47tLfNhe7i80');

        var tab_ind = 0
        var table_data = []

      return new Promise((resolve, reject) => {
        base('Trials').select({

            // filterByFormula: airtableFilters,
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

            var tabledata = {}
            tabledata["tabledata"] = table_data
            resolve(tabledata)
        })
      })
  }

  let options = {
    height: 500,
    placeholder: "Loading Data...",

  };

  let columns = [
      { title: "Age Groups", field: "Age_Groups", width: 150 },
      { title: "Conditions", field: "Conditions", hozAlign: "left", width: 150 },
      { title: "Countries", field: "Geography_Countries", hozAlign: "left", width: 150  },
      { title: "Enrollment", field: "Enrollment", hozAlign: "left", width: 150 },
      { title: "Enrollment Target", field: "Enrollment_Target", hozAlign: "left", width: 150 },
      { title: "Settings", field: "Facility_Settings", hozAlign: "left", width: 150 },
      { title: "Regions", field: "Geography_Regions", hozAlign: "left", width: 150 },
      { title: "Intervention Types", field: "Intervention_Types", hozAlign: "left", width: 150 },
      { title: "Interventions", field: "Interventions", hozAlign: "left", width: 150 },
      { title: "NCT", field: "NCT", hozAlign: "left", width: 150 },
      { title: "Outcomes", field: "Outcome_Concepts", hozAlign: "left", width: 150 },
      { title: "Phase", field: "Phase", hozAlign: "left", width: 150 },
      { title: "Purpose", field: "Purpose", hozAlign: "left", width: 150 },
      { title: "Randomization", field: "Randomization", hozAlign: "left", width: 150 },
      { title: "Single/Multi Site", field: "Single_Multi_Site", hozAlign: "left", width: 150 },
      { title: "Sponsor", field: "Sponsor", hozAlign: "left", width: 150 },
      { title: "Start Year", field: "Start_Year", hozAlign: "left", width: 150 },
      { title: "Status", field: "Status", hozAlign: "left", width: 150 },
      { title: "Study Type", field: "Study_Type", hozAlign: "left", width: 150 },
      { title: "Title", field: "Title", hozAlign: "left", width: 150 }
      ];





    async function setData() {
      const res = await getTableData()
      console.log("RES: ", res.tabledata)
      const new_data = res.tabledata

      // console.log('this2', this.ref)

      options = {height: 500, placeholder:"Loading Data..."}
      data = new_data


    }

    setData()




class MainTable extends React.Component {
  // state = {
  //   data: [],
  // };
  ref = null;




  render() {


    return (
      <div>
        <ReactTabulator

          columns={columns}
          data={data}
          options={options}


        />

      </div>
    );
  }
}

export default MainTable;


















// import React, { Component } from 'react'
// import axios from 'axios'
// import ReactTable from "react-table";
// import 'react-table/react-table.css'
//
// export default class MainTable extends Component {
//   constructor(props){
//     super(props)
//     this.state = {
//       users: [],
//       loading:true
//     }
//   }
//
//
//     // const columns = [
//     // { title: "Age Groups", field: "Age_Groups", width: 150 },
//     // { title: "Conditions", field: "Conditions", hozAlign: "left", width: 150 },
//     // { title: "Countries", field: "Geography_Countries", hozAlign: "left", width: 150  },
//     // { title: "Enrollment", field: "Enrollment", hozAlign: "left", width: 150 },
//     // { title: "Enrollment Target", field: "Enrollment_Target", hozAlign: "left", width: 150 },
//     // { title: "Settings", field: "Facility_Settings", hozAlign: "left", width: 150 },
//     // { title: "Regions", field: "Geography_Regions", hozAlign: "left", width: 150 },
//     // { title: "Intervention Types", field: "Intervention_Types", hozAlign: "left", width: 150 },
//     // { title: "Interventions", field: "Interventions", hozAlign: "left", width: 150 },
//     // { title: "NCT", field: "NCT", hozAlign: "left", width: 150 },
//     // { title: "Outcomes", field: "Outcome_Concepts", hozAlign: "left", width: 150 },
//     // { title: "Phase", field: "Phase", hozAlign: "left", width: 150 },
//     // { title: "Purpose", field: "Purpose", hozAlign: "left", width: 150 },
//     // { title: "Randomization", field: "Randomization", hozAlign: "left", width: 150 },
//     // { title: "Single/Multi Site", field: "Single_Multi_Site", hozAlign: "left", width: 150 },
//     // { title: "Sponsor", field: "Sponsor", hozAlign: "left", width: 150 },
//     // { title: "Start Year", field: "Start_Year", hozAlign: "left", width: 150 },
//     // { title: "Status", field: "Status", hozAlign: "left", width: 150 },
//     // { title: "Study Type", field: "Study_Type", hozAlign: "left", width: 150 },
//     // { title: "Title", field: "Title", hozAlign: "left", width: 150 }
//     // ];
//
//
//
//   async getUsersData(){
//
//     const res = await getTableData()
//     console.log(res.tabledata)
//     this.setState({loading:false, users: res.tabledata})
//   }
//   componentDidMount(){
//     this.getUsersData()
//   }
//   render() {
//     const columns = [{
//       Header: "Age Groups",
//       accessor: "Age_Groups",
//      }
//      ,{
//       Header: "Conditions",
//       accessor: "Conditions",
//
//       }
//
//      ,{
//      Header: "Countries",
//      accessor: "Geography_Countries",
//      }
//      ,{
//      Header: "Enrollment",
//      accessor: "Enrollment",
//
//      },
//      {
//       Header: "Settings",
//       accessor: "Facility_Settings",
//
//       },
//       {
//         Header: "Regions",
//         accessor: "Geography_Regions",
//
//         }
//   ]
//     return (
//       <ReactTable
//       data={this.state.users}
//       columns={columns}
//    />
//     )
//   }
// }
