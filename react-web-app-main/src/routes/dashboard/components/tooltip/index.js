import React from 'react'

import './index.css'

const ChartTooltip = (props) => {

  if (props.name)
    return (
      <div className="chart-tooltip">
          <p className="tooltip-value">{props.value || 0}</p>
          <div className="tooltip-divider"></div>
          <p className="tooltip-text">{props.text}</p>
      </div>
    )

  else
    return (
      <div className="chart-tooltip">
          <p className="tooltip-value">{props.value || 0}</p>
          <div className="tooltip-divider"></div>
          <p className="tooltip-text">{props.text}</p>
      </div>
    )
}

export default ChartTooltip
