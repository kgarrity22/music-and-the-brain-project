import React, { useCallback, useEffect, useState } from 'react'

import Spinner from 'react-spinkit'
import { ResponsiveBar } from '@nivo/bar'

import ChartTooltip from '../tooltip'
import { COLORS, COLOR_SCHEMES } from '../../../../constants'

import './index.css'

const theme = { tooltip: { container: { padding: 0 } } }
const valueScale = { type: 'linear', reverse: false }
const indexScale = { type: 'band', round: true }
const borderColor = { from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }

const PrismBarChart = (props) => {

  const [legends, setLegends] = useState([])
  const [margins, setMargins] = useState({ top: 20, right: 10, bottom: 50, left: 200 })
  useEffect(() => {
    if (props.layout === "vertical"){
      setLegends([])
      setMargins(m => ({...m, right: 50, left: 50, bottom: props.marginBottom, top: 20}))
    }
    else if (props.layout !== 'horizontal') {
      setLegends([{
        dataFrom: 'keys',
        anchor: 'right',
        direction: 'column',
        justify: false,
        translateX: 125,
        translateY: 0,
        itemsSpacing: 5,
        itemWidth: 100,
        itemHeight: 10,
        itemDirection: 'left-to-right',
        itemOpacity: 0.85,
        symbolSize: 10,
        effects: [{
          on: 'hover',
          style: {
            itemOpacity: 1
          }
        }]
      }])

      setMargins(m => ({...m, right: 200, left: 50}))
    }
    else {
      setLegends([])
      setMargins(m => ({...m, right: 10, left: 200}))
    }
  }, [props.layout])

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

  const [axisBottom, setAxisBottom] = useState({})
  useEffect(() => {
    setAxisBottom({
        tickSize: 0,
        tickPadding: 5,
        tickRotation: -50,
        legend: props.xAxisLabel,
        legendPosition: 'middle',
        legendOffset: 0
    })
  }, [props.xAxisLabel])

  const [axisLeft, setAxisLeft] = useState({})
  useEffect(() => {
    setAxisLeft({
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.yAxisLabel,
        legendPosition: 'middle',
        legendOffset: -100
    })
  }, [props.yAxisLabel])

  const [enableGridX, setEnableGridX] = useState(false)
  const [enableGridY, setEnableGridY] = useState(false)
  useEffect(() => {
    setEnableGridX(props.layout === 'horizontal')
    setEnableGridY(props.layout !== 'horizontal')
  }, [props.layout])

  const generateTooltip = useCallback(
    (e) => {
      return (<ChartTooltip text={e.id} value={e.value} />)
    }, []
  )

  const [layout, setLayout] = useState('vertical')
  useEffect(() => {
    setLayout(props.layout || 'vertical')
  }, [props.layout])

  return (
    <div className="bar-chart-container">
      <p className="chart-title">{props.title}</p>
      <div className="chart" style={{"height": props.chartHeight}}>
        <ResponsiveBar
          theme={ theme }

          data={props.chartData}
          keys={props.groupKeys}
          margin={margins}
          indexBy={props.indexKey}
          layout={ layout }
          padding={0.3}
          valueScale={ valueScale }
          indexScale={ indexScale }
          colors={ colors }
          borderColor={ borderColor }
          isInteractive={true}
          tooltip={ generateTooltip }
          axisTop={null}
          axisRight={null}
          axisBottom={ axisBottom }
          axisLeft={ axisLeft }
          enableLabel={false}
          legends={legends}
          animate={false}
          enableGridX={ enableGridX}
          enableGridY={ enableGridY }
          groupMode={ props.groupMode }
      />
      </div>
      {
        props.loading &&
        <div className="overlay">
          <Spinner name="ball-beat" color={"blue"} />
        </div>
      }
    </div>
  )
}

export default PrismBarChart;
