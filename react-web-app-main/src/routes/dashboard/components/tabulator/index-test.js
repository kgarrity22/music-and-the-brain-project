import React from 'react';
import {Row, Col, Card} from 'react-bootstrap';

import 'react-tabulator/lib/styles.css';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/css/tabulator.min.css'; // theme



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
    downloadDataFormatter: (data) => data,
    downloadReady: (fileContents, blob) => blob,

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

      // options = {height: 500,
      //     placeholder:"Loading Data...",
      //     downloadDataFormatter: (data) => data,
      //     downloadReady: (fileContents, blob) => blob,
      // }
      data = new_data
    }



class TabulatorTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
        errorMsg: ""
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
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
                      this.setState({
                        isLoaded: true,
                        err
                      });
                  }
                    var tabledata = {}
                    tabledata["tabledata"] = table_data

                    this.setState({
                      isLoaded: true,
                      items: tabledata.table_data
                    })

            })
        })
    }
  }// end of fetch



    downloadData = () => {
      console.log("THIS: ", this)
      this.download("csv", "data.csv");
    };

    render() {
        const { items, error } = this.state;
        //console.log("checking this: ", this)
        const options = {
            pagination: 'local',
            paginationSize:20,
            paginationSizeSelector:[20, 50, 100],
            layout:'fitDataFill',
            movableColumns: true,
            selectable:true,
            downloadDataFormatter: (data) => data,
            downloadReady: (fileContents, blob) => blob
        };
        return (

                <Row>
                    <Col>
                        <Card>
                            <Card.Header>
                                <Card.Title as="h5">Available Properties</Card.Title>
                            </Card.Header>
                            <Card.Body>
                            <button onClick={this.downloadData}>Download</button>
                                <ReactTabulator
                                  data={items}
                                  columns={columns}
                                  tooltips={true}
                                  layout={"fitData"}
                                  options={options}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

        );
    }
}
export default TabulatorTable;
