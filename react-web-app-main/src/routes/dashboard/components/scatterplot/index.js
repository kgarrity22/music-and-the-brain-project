import React, { useCallback, useEffect, useState } from 'react'

import { Dropdown } from 'react-bootstrap'
import Spinner from 'react-spinkit'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'

import { COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'

import './index.css'

const PrismScatterplot = (props) => {

  const [ legends, setLegends ] = useState([])
  const [ margins, setMargins ] = useState({})
  const [ scale, setScale ] = useState({})
  const [ colors, setColors ] = useState([])
  const [ nodeSize, setNodeSize ] = useState({})
  useEffect(() => {
    setLegends([{
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
    }])
    setMargins({ top: 60, right: 140, bottom: 70, left: 150 })
    setScale({ type: 'point' })
    setColors(COLOR_SCHEMES['rainbow'])
    setNodeSize({ key: 'z', values: [1, 2000], sizes: [10, 50] })
  }, [])

  const [axisLeft, setAxisLeft] = useState({})
  useEffect(() => {
    setAxisLeft({
        orient: 'left',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.yAxisLabel,
        legendPosition: 'middle',
        legendOffset: -120
    })
  }, [props.yAxisLabel])

  const [axisBottom, setAxisBottom] = useState({})
  useEffect(() => {
    setAxisBottom({
        orient: 'bottom',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.xAxisLabel,
        legendPosition: 'middle',
        legendOffset: 46
    })
  }, [props.xAxisLabel])

  const generateTooltip = useCallback(
    (e) => {
      return (<ChartTooltip text={e.node.data.y} value={e.node.data.z} />)
    }, []
  )

  return (
    <div className="scatterplot-chart-container">
      <div className="chart-title-container">
        <p className="chart-title">{props.title}</p>
        <div className="dropdown-filters-container">
          <div className="dropdown-container">
            <p>X</p>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">Trial Start Date</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item active>Trial Start Date</Dropdown.Item>
                <Dropdown.Item>Technology as Outcome</Dropdown.Item>
                <Dropdown.Item>Age Group</Dropdown.Item>
                <Dropdown.Item>Component as Intervention</Dropdown.Item>
                <Dropdown.Item>Component as Outcome</Dropdown.Item>
                <Dropdown.Item>Sponsor</Dropdown.Item>
                <Dropdown.Item>Sponsor Type</Dropdown.Item>
                <Dropdown.Item>Condition</Dropdown.Item>
                <Dropdown.Item>Country</Dropdown.Item>
                <Dropdown.Item>Region</Dropdown.Item>
                <Dropdown.Item>Trial Duration</Dropdown.Item>
                <Dropdown.Item>Outcome</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="dropdown-container">
            <p>Y</p>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">Technology as Intervention</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item active>Technology as Intervention</Dropdown.Item>
                <Dropdown.Item>Technology as Outcome</Dropdown.Item>
                <Dropdown.Item>Age Group</Dropdown.Item>
                <Dropdown.Item>Component as Intervention</Dropdown.Item>
                <Dropdown.Item>Component as Outcome</Dropdown.Item>
                <Dropdown.Item>Sponsor</Dropdown.Item>
                <Dropdown.Item>Sponsor Type</Dropdown.Item>
                <Dropdown.Item>Condition</Dropdown.Item>
                <Dropdown.Item>Country</Dropdown.Item>
                <Dropdown.Item>Region</Dropdown.Item>
                <Dropdown.Item>Trial Duration</Dropdown.Item>
                <Dropdown.Item>Outcome</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="dropdown-container">
            <p>N</p>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">Enrollment</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item active>Enrollment</Dropdown.Item>
                <Dropdown.Item>Trial Volume</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="chart">
        <ResponsiveScatterPlot
          data={ props.chartData }
          margin={ margins }
          xScale={ scale }
          yScale={ scale }
          blendMode="multiply"
          colors={ colors }
          nodeSize={ nodeSize }
          tooltip={ generateTooltip }
          animate={ false }
          axisTop={ null }
          axisRight={ null }
          axisBottom={ axisBottom }
          axisLeft={ axisLeft }
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

export default PrismScatterplot;
