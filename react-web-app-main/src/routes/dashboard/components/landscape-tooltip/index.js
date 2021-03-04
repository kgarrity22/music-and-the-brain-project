import React from 'react'

import './index.css'


const LandscapeTooltip = (props) => {
  let items = []

  for (let item of props.all) {
    if (props.all.length > 1 ){
      items.push(
        <div className="landsape-tooltip-holder">
          <li><strong>Authors: </strong>{item.Authors}</li>
          <li><strong>Title: </strong> {item.Title}</li>
          <li>Design: {item.Design}</li>
          <hr />
        </div>
      )
    } else {
      items.push(
        <div className="landsape-tooltip-holder">
          <li><strong>Authors: </strong>{item.Authors}</li>
          <li><strong>Title: </strong> {item.Title}</li>
          <li><strong>Design: </strong> {item.Design}</li>
        </div>
      )
    }
  }

  return (
    <div>
      {items}
    </div>
  )
}

export default LandscapeTooltip
