
import React from "react";
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x
import { ReactTabulator } from 'react-tabulator'

import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css"; // use Theme(s)



  let options = {

    // height: 600,
    placeholder: "Loading Data...",
    downloadDataFormatter: (data) => data,
    downloadReady: (fileContents, blob) => blob,
    resizable:false,
    virtualDomBuffer:1000,
    tooltips:true,

  };



  let columns = [
    { title: "Authors", field: "Authors", hozAlign: "left", width: 150 },
    { title: "Year", field: "Year", hozAlign: "left", width: 150 },
    { title: "Title", field: "Title", hozAlign: "left", width: 150 },
    { title: "Location", field: "Location", hozAlign: "left", width: 150 },
    { title: "Conditions", field: "Conditions", hozAlign: "left", width: 150 },
    { title: "Design", field: "Design", hozAlign: "left", width: 150 },
    { title: "Intervention Type", field: "Intervention_Type", hozAlign: "left", width: 150 },
    { title: "Study Population", field: "Study_Pop_Stnd", hozAlign: "left", width: 150 },
    { title: "Race/Ethnicity", field: "Race_Eth", hozAlign: "left", width: 150 },
    { title: "Sample Size", field: "Sample_Size", hozAlign: "left", width: 150 },
    { title: "Interventions", field: "Interventions", hozAlign: "left", width: 150 },
    { title: "Activity_Type", field: "Activity_Type", hozAlign: "left", width: 150 },
    { title: "Comparator", field: "Comparator", hozAlign: "left", width: 150 },
    { title: "Outcomes", field: "Outcomes", hozAlign: "left", width: 150 },
    { title: "Results", field: "Results", hozAlign: "left", width: 150 },
  ]




class MainTable extends React.Component {
  ref = null;

  downloadData = () => {
    console.log("This first one: ", this.ref.table.modules.download)
      this.ref.table.download("csv", "data.csv");

    };


  render() {


    return (
      <div>
        <button className="btn btn-primary download-btn" onClick={this.downloadData}>Download</button>
        <ReactTabulator
          ref={ref => (this.ref = ref)}
          columns={columns}
          data={this.props.tabledata}
          updateData={this.props.updateData}
          options={options}
          height={this.props.height}
        />
      </div>
    );
  }
}

export default MainTable;
