import React from 'react';
import {Row, Col, Card} from 'react-bootstrap';
// import Aux from "../../hoc/_Aux";
import 'react-tabulator/lib/styles.css';
import { ReactTabulator } from 'react-tabulator';
import 'react-tabulator/lib/css/tabulator.min.css'; // theme

// const columns = [
//    { title: "Area", field: "Area", align: "center" },
//    { title: "Cash Flow (Mo)", field: "Cash Flow (Mo)", align: "right" },
//    { title: "ROI", field: "ROI", align: "right" },
//    { title: "Total Rent", field: "Total Rent", align: "right" },
//    { title: "Downpayment", field: "Downpayment", align: "right" },
//    { title: "Loan Balance", field: "Loan Balance", align: "right" },
//    { title: "P&I", field: "P&I", align: "right" },
//    { title: "PITI", field: "PITI", align: "right" },
//    { title: "Taxes (Mo)", field: "Taxes (Mo)", align: "right" },
//    { title: "Ins (Mo)", field: "Ins (Mo)", align: "right" }
// ];

const columns = [
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


// const PrismPieChart {
const TabulatorTable = (props)  =>  {

  let ref = null;



    let downloadData = () => {
      this.ref.table.download("xlsx", "data.xlsx");
    };
    const options = {
            paginationSizeSelector:[20, 50, 100],
            layout:'fitDataFill',

            downloadDataFormatter: (data) => data,
            downloadReady: (fileContents, blob) => blob
        };

    // render() {
    //     const { items, error } = this.state;
    //     const options = {
    //
    //         paginationSizeSelector:[20, 50, 100],
    //         layout:'fitDataFill',
    //
    //         downloadDataFormatter: (data) => data,
    //         downloadReady: (fileContents, blob) => blob
    //     };
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
                                  ref={ref => (this.ref = ref)}
                                  data={ props.data }
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

export default TabulatorTable;
