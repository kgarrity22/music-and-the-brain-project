import React from 'react'

import './index.css'


const LandscapeTooltip = (props) => {
  let items = []
  //console.log("PROPSALL: ", props)
  let header = ""
  // want a title that has the x and y axis - an h2
  if (typeof(props.all.formattedX)==='object'){
    let x = String(props.all.x)
    header = x.slice(11, 15) + " by " + props.all.y
  } else {
    header = props.all.x + " by " + props.all.y
  }
  // let header = props.all.x + " by " + props.all.y
  // items.push(<div className="landscape-tooltip-header">
  //               <h2>{header}</h2>
  //             </div>
  // )
  let all = props.all.all
  for (let item of Object.keys(all)){
    items.push(
      <li><strong>{item} :</strong> {(all[item]).length} Records</li>
    )

  }

  // for (let item of Object.keys(props.all)) {
  //   if ((Object.keys(props.all)).length > 1 ){
  //     items.push(
  //       <div className="landsape-tooltip-holder">
  //         <li><strong>Authors: </strong>{item.Authors}</li>
  //         <li><strong>Title: </strong> {item.Title}</li>
  //         <li><strong>Design: </strong>{item.Design}</li>
  //         <hr />
  //       </div>
  //     )
  //   } else {
  //     items.push(
  //       <div className="landsape-tooltip-holder">
  //         <li><strong>Authors: </strong>{item.Authors}</li>
  //         <li><strong>Title: </strong> {item.Title}</li>
  //         <li><strong>Design: </strong> {item.Design}</li>
  //       </div>
  //     )
  //   }
  //}

  return (
    <div className="landsape-tooltip-holder">
      <div className="landscape-tooltip-header">
        <h2>{header}</h2>
      </div>
      {items}
    </div>
  )
}

export default LandscapeTooltip
