import React from 'react'

import './index.css'


const LandscapeTooltip = (props) => {
  let items = []
  //console.log("PROPSALL: ", props)

  // want a title that has the x and y axis - an h2
  let header = props.all.x + " by " + props.all.y
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
