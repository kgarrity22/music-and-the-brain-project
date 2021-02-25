import React, { useEffect, useState } from 'react'

import Spinner from 'react-spinkit'
import { ResponsiveAreaBump } from '@nivo/bump'

import { COLORS, COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'

import './index.css'


const PrismAreaBump = (props) => {

  const [colors, setColors] = useState([])
  useEffect(() => {
    if (props.colorScheme) {
      setColors({'scheme': props.colorScheme})
    }
    else if (props.colors) {
      setColors(COLOR_SCHEMES[props.colors])
    } else if (props.color) {
      setColors([COLORS[props.color]])
    }
  }, [props.color, props.colors, props.colorScheme])

  return (
    <div className="area-bump-container">
      <p className="chart-title">{props.title}</p>
      {
          props.chartData && props.chartData[0] && props.chartData[0].data && props.chartData[0].data.length === 0 &&
          <p className="no-data-label">Not Enough Data Selected</p>
      }
      {
        props.chartData && props.chartData[0] && props.chartData[0].data && props.chartData[0].data.length > 0 &&
        <div className="chart">
          <ResponsiveAreaBump
            data={ props.chartData }
            margin={{ top: 40, right: 10, bottom: 40, left: 200 }}
            spacing={10}
            colors={ colors }
            animate={false}
            tooltip={e => <ChartTooltip text={e.point.serieId} value={e.point.data.y} /> }
            startLabel={ "id" }
            endLabel={ false }
            axisTop={ null }
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,

              tickRotation: 90,
              tickNumber: 5,

              legend: '',
              legendPosition: 'middle',
              legendOffset: 32
            }}
        />
        </div>
      }
      {
        props.loading &&
        <div className="overlay">
          <Spinner name="ball-beat" color={colors[0]} />
        </div>
      }
    </div>
  )
}

const compareChartData = (prevProps, nextProps) => {
  return prevProps.chartData === nextProps.chartData && prevProps.loading === nextProps.loading
}

export default React.memo(PrismAreaBump, compareChartData);
