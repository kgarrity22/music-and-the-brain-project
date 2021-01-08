import React, { useCallback, useEffect, useState } from 'react'

import Spinner from 'react-spinkit'
import { ResponsivePie } from '@nivo/pie'

import { COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'

import './index.css'

const intialLegends = [{
  anchor: 'center',
  direction: 'column',
  justify: false,
  translateX: 225,
  translateY: 0,
  itemsSpacing: 5,
  itemWidth: 100,
  itemHeight: 18,
  itemTextColor: '#999',
  itemDirection: 'left-to-right',
  itemOpacity: 1,
  symbolSize: 18,
  symbolShape: 'square',
  effects: [{
    on: 'hover',
    style: {
      itemTextColor: '#000'
    }
  }]
}]

const initialBorderColor = { from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }

const PrismPieChart = (props) => {

  const [legends, ] = useState(intialLegends)
  const [borderColor, ] = useState(initialBorderColor)

  const [colors, setColors] = useState([])
  useEffect(() => {
    if (props.colors) {
      setColors(COLOR_SCHEMES[props.colors])
    }
  }, [props.colors])

  const generateTooltip = useCallback(
    (e) => {
      return (<ChartTooltip text={e.datum.label} value={e.datum.value} />)
    }, []
  )

  return (
    <div className="pie-chart-container">
      <p className="chart-title">{props.title}</p>
      <div className="chart">
        <ResponsivePie
          data={ props.chartData }
          colors={ colors }
          borderWidth={1}
          borderColor={ borderColor }
          enableRadialLabels={false}
          innerRadius={0.5}
          padAngle={2}
          cornerRadius={4}
          sliceLabelsSkipAngle={10}
          sliceLabelsTextColor="#333333"
          isInteractive={true}
          tooltip={ generateTooltip }
          legends={ legends }
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

export default PrismPieChart;
