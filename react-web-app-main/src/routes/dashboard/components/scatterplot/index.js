import React from 'react'

import { Dropdown } from 'react-bootstrap'
import Spinner from 'react-spinkit'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'

import { COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'

import './index.css'

const PrismScatterplot = (props) => {

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

  let dropdownItems = {
    "Start Year": "Start_Year",
    "Age Groups": "Age_Groups",
    "Sponsors": "Sponsor",
    "Sponsor Types": "Sponsor_Type",
    "Study Types": "Study_Type",
    "Outcomes": "Outcome_Concepts",
    "Settings": "Facility_Settings",
    "Regions": "Geography_Regions",
    "Interventions": "Interventions_Rollup"
  }

  return (
    <div className="scatterplot-chart-container">
      <div className="chart-title-container">
        <p className="chart-title">{props.title}</p>
        <div className="dropdown-filters-container">
          <div className="dropdown-container">
            <p>X</p>
            <Dropdown onSelect={(evtKey, evt) => props.setLandscapeAxis("x", evt.target.text)}>
              <Dropdown.Toggle variant="success" id="dropdown-basic">{props.xAxisLabel}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Start Year</Dropdown.Item>
                <Dropdown.Item>Age Groups</Dropdown.Item>
                <Dropdown.Item>Sponsors</Dropdown.Item>
                <Dropdown.Item>Sponsor Types</Dropdown.Item>
                <Dropdown.Item>Study Types</Dropdown.Item>
                <Dropdown.Item>Outcomes</Dropdown.Item>
                <Dropdown.Item>Settings</Dropdown.Item>
                <Dropdown.Item>Regions</Dropdown.Item>
                <Dropdown.Item>Interventions</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="dropdown-container">
            <p>Y</p>
            <Dropdown onSelect={(evtKey, evt) => props.setLandscapeAxis("y", evt.target.text)}>
              <Dropdown.Toggle variant="success" id="dropdown-basic">{props.yAxisLabel}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Start Year</Dropdown.Item>
                <Dropdown.Item>Age Groups</Dropdown.Item>
                <Dropdown.Item>Sponsors</Dropdown.Item>
                <Dropdown.Item>Sponsor Types</Dropdown.Item>
                <Dropdown.Item>Study Types</Dropdown.Item>
                <Dropdown.Item>Outcomes</Dropdown.Item>
                <Dropdown.Item>Settings</Dropdown.Item>
                <Dropdown.Item>Regions</Dropdown.Item>
                <Dropdown.Item>Interventions</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="dropdown-container">
            <p>N</p>
            <Dropdown onSelect={(evtKey, evt) => props.setLandscapeAxis("z", evt.target.text)}>
              <Dropdown.Toggle variant="success" id="dropdown-basic">{props.zAxisLabel}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Enrollment</Dropdown.Item>
                <Dropdown.Item>Trial Volume</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
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
            margin={{ top: 100, right: 140, bottom: 200, left: 200 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'point' }}
            blendMode="multiply"
            colors={ COLOR_SCHEMES['rainbow'] }
            nodeSize={{ key: 'z', values: [props.minNodeSize, props.maxNodeSize], sizes: [10, 150] }}
            tooltip={ (e) => <ChartTooltip text={e.node.data.y} value={e.node.data.z} /> }
            animate={ false }
            axisTop={ null }
            axisRight={ null }
            axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: null
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

export default React.memo(PrismScatterplot, compareChartData);
