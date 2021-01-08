import React, { useCallback, useEffect, useState } from 'react'

import Spinner from 'react-spinkit'
import { ResponsiveSunburst } from '@nivo/sunburst'

import { COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'
import './index.css'

const theme = {tooltip: {container: {padding: 0}}}
const childColor = { from: 'color' }

const PrismSunburst = (props) => {

  const [colors, setColors] = useState([])
  useEffect(() => {
    if (props.colors) {
      setColors(COLOR_SCHEMES[props.colors])
    }
  }, [props.colors])

  const generateTooltip = useCallback(
    (e) => {
      return (<ChartTooltip text={e.name} value={e.value} />)
    }, []
  )

  return (
    <div className="sunburst-chart-container">
      <p className="chart-title">{props.title}</p>
      <div className="chart">
        <ResponsiveSunburst
            theme={ theme }
            data={ props.chartData }
            identity="name"
            value="value"
            cornerRadius={2}
            borderWidth={1}
            borderColor="white"
            colors={ colors }
            childColor={ childColor }
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            isInteractive={true}
            tooltip={ generateTooltip }
        />
      </div>
      {
        props.loading &&
        <div className="overlay">
          <Spinner name="ball-beat" color={colors[0]} />
        </div>
      }
    </div>
  )
}

export default PrismSunburst
