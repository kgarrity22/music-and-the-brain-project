import React from 'react'

import { Dropdown } from 'react-bootstrap'
import Spinner from 'react-spinkit'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'

import { COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'

import './index.css'

const PrismStaticScatterplot = (props) => {

  // const calculateHeight = () => {
  //   let numYKeys = 0
  //   for(let i=0; i<props.chartData.length; i++) {
  //     const dataSet = props.chartData[i]
  //     console.log(dataSet)
  //     if (dataSet.data && dataSet.data.length > numYKeys)
  //       numYKeys = dataSet.data.length
  //   }
  //   console.log(numYKeys)
  //   console.log(numYKeys * 10)
  //   return numYKeys * 10
  // }
  // const height = calculateHeight()



  return (
    <div className="scatterplot-chart-container">
      <div className="chart-title-container">
        <p className="chart-title">{props.title}</p>

      </div>
      {
          props.chartData.length === 0 &&
          <p className="no-data-label">Not Enough Data Selected</p>
      }
      {
        props.chartData.length > 0 &&
        <div className="chart" style={{height: props.chartHeight}}>
          <ResponsiveScatterPlot
            data={ props.chartData }
            height={props.chartHeight}
            margin={{ top: 100, right: 140, bottom: 200, left: 230 }}
            xScale={{ type: props.type, format: props.format, precision: props.precision, min: props.xMin, max: props.xMax  }}
            xFormat={ props.xFormat }
            yScale={{ type: 'point' }}
            blendMode="multiply"
            colors={ COLOR_SCHEMES['rainbow'] }
            nodeSize={{ key: 'z', values: [props.minNodeSize, props.maxNodeSize], sizes: [10, 150] }}
            tooltip={ (e) => <ChartTooltip text={e.node.data.y} value={e.node.data.z} /> }
            gridXValues={ props.xVals }
            gridYValues={ props.yVals }
            animate={ false }
            axisTop={ null }
            axisRight={ null }
            axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: null,
                format: props.axisBottomFormat,
                tickValues: props.tickValues

            }}
            axisLeft={{
                orient: 'left',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: null
            }}
            legends={[{
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 130,
              translateY: 0,
              itemWidth: 100,
              itemHeight: 12,
              itemsSpacing: 5,
              itemDirection: 'left-to-right',
              symbolSize: 12,
              symbolShape: 'square',
              effects: [{
                on: 'hover',
                style: {
                  itemOpacity: 1
                }
              }]
            }]}
          />
        </div>
      }
      {
        props.loading &&
        <div className="overlay">
          <Spinner name="ball-beat" color={COLOR_SCHEMES['rainbow'][0]} />
        </div>
      }
    </div>
  )
}

const compareChartData = (prevProps, nextProps) => {
  return prevProps.chartData === nextProps.chartData && prevProps.loading === nextProps.loading
}

export default React.memo(PrismStaticScatterplot, compareChartData);
