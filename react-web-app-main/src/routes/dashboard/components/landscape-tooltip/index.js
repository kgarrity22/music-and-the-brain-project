import React from 'react'

import './index.css'


const LandscapeTooltip = (props) => {
  let items = []

  for (let item of props.all) {
    items.push(
      <div>
        <li>Authors: {item.Authors}</li>
        <li>Year: {item.Year}</li>
        <li>Title: {item.Title}</li>
        <li>Location: {item.Location}</li>
        <li>Conditions: {item.Conditions}</li>
        <li>Design: {item.Design}</li>
        <li>Intervention Type: {item.Intervention_Type}</li>
      </div>


    )
  }
  return (
    <div>
      {items}
    </div>
  )
}

export default LandscapeTooltip

//
// { Header: "Authors", accessor: "Authors" },
// { Header: "Year", accessor: "Year" },
// { Header: "Title", accessor: "Title" },
// { Header: "Location", accessor: "Location" },
// { Header: "Conditions", accessor: "Conditions" },
// { Header: "Design", accessor: "Design" },
// { Header: "Intervention Type", accessor: "Intervention_Type" },
// { Header: "Study Population", accessor: "Study_Pop_Stnd" },
// { Header: "Race/Ethnicity", accessor: "Race_Eth" },
// { Header: "Sample Size", accessor: "Sample_Size" },
// { Header: "Interventions", accessor: "Interventions" },
// { Header: "Activity_Type", accessor: "Activity_Type" },
// { Header: "Comparator", accessor: "Comparator" },
// { Header: "Outcomes", accessor: "Outcomes" },
// { Header: "Results", accessor: "Results" },
