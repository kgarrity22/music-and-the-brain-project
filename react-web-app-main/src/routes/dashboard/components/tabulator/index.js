
import React from "react";
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x
import { ReactTabulator } from 'react-tabulator'

import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css"; // use Theme(s)


  let options = {

    height: 600,
    placeholder: "Loading Data...",
    downloadDataFormatter: (data) => data,
    downloadReady: (fileContents, blob) => blob,
    resizable:false,
    virtualDomBuffer:1000,
    tooltips:true,

  };

  let columns = [
      { title: "NCT", field: "NCT", hozAlign: "left", formatter:"link", formatterParams:{urlField:"CTgov_Link", target:"_blank"}, width: 150 },
      { title: "Start Year", field: "Start_Year", hozAlign: "left", width: 150 },
      { title: "Study Type", field: "Study_Type", hozAlign: "left", width: 150 },
      { title: "Title", field: "Title", hozAlign: "left", width: 150 },
      { title: "Sponsor", field: "Sponsor", hozAlign: "left", width: 150 },
      { title: "Status", field: "Status", hozAlign: "left", width: 150 },
      { title: "Purpose", field: "Purpose", hozAlign: "left", width: 150 },
      { title: "Phase", field: "Phase", hozAlign: "left", width: 150 },
      { title: "Randomization", field: "Randomization", hozAlign: "left", width: 150 },
      { title: "Single/Multi Site", field: "Single_Multi_Site", hozAlign: "left", width: 150 },
      { title: "Age Groups", field: "Age_Groups", width: 150 },
      { title: "Settings", field: "Facility_Settings", hozAlign: "left", width: 150 },
      { title: "Enrollment", field: "Enrollment", hozAlign: "left", width: 150 },
      { title: "Intervention Types", field: "Intervention_Types", hozAlign: "left", width: 150 },
      { title: "Interventions", field: "Interventions", hozAlign: "left", width: 150 },
      { title: "Regions", field: "Geography_Regions", hozAlign: "left", width: 150 },
      { title: "Countries", field: "Geography_Countries", hozAlign: "left", width: 150  },
      { title: "Outcomes", field: "Outcome_Concepts", hozAlign: "left", width: 150 }
      ];




class MainTable extends React.Component {
  ref = null;

  downloadData = () => {
    console.log("This first one: ", this.ref.table.modules.download)
      this.ref.table.download("csv", "data.csv");

    };


  render() {


    return (
      <div>
        <button class="btn btn-primary download-btn" onClick={this.downloadData}>Download</button>
        <ReactTabulator
          ref={ref => (this.ref = ref)}
          columns={columns}
          data={this.props.tabledata}
          updateData={this.props.updateData}
          options={options}
        />
      </div>
    );
  }
}

export default MainTable;
