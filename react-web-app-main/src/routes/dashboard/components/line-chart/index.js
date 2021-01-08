import React, { useCallback, useEffect, useState } from 'react'

import Spinner from 'react-spinkit'
import { ResponsiveLine } from '@nivo/line'

import { COLORS, COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'

import './index.css'

const scale = { type: 'linear', min: 'auto', max: 'auto', reverse: false }
const pointColor = { theme: 'background' }
const pointBorderColor = { from: 'serieColor' }

const PrismLineChart = (props) => {

  const [margins, setMargins] = useState({ top: 10, right: 10, bottom: 50, left: 50 })
  const [legends, setLegends] = useState([])
  useEffect(() => {
    if (props.showLegend === true) {
      setLegends([{
        anchor: 'bottom-right',
        direction: 'column',
        justify: false,
        translateX: 100,
        translateY: 0,
        itemsSpacing: 5,
        itemDirection: 'left-to-right',
        itemWidth: 80,
        itemHeight: 20,
        itemOpacity: 0.75,
        symbolSize: 12,
        symbolShape: 'square',
        symbolBorderColor: 'rgba(0, 0, 0, .5)',
        effects: [{
          on: 'hover',
          style: {
            itemBackground: 'rgba(0, 0, 0, .03)',
            itemOpacity: 1
          }
        }]
      }])
      setMargins(m => ({...m, right: 200}))
    }
    else {
      setLegends([])
      setMargins(m => ({...m, right: 10}))
    }
  }, [props.showLegend])

  const [axisLeft, setAxisLeft] = useState([])
  useEffect(() => {
    setAxisLeft({
        orient: 'left',
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.yAxisLabel,
        legendOffset: -40,
        legendPosition: 'middle'
    })
  }, [props.yAxisLabel])

  const [axisBottom, setAxisBottom] = useState([])
  useEffect(() => {
    setAxisBottom({
        orient: 'bottom',
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.xAxisLabel,
        legendOffset: 36,
        legendPosition: 'middle'
    })
  }, [props.xAxisLabel])

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

  const generateTooltip = useCallback(
    (e) => {
      return (<ChartTooltip text={e.point.serieId} value={e.point.data.y} />)
    }, []
  )

  return (
    <div className="line-chart-container">
      <p className="chart-title">{props.title}</p>
      <div className="chart">
        <ResponsiveLine
          data={ props.chartData }
          margin={ margins }
          xScale={ scale }
          yScale={ scale }
          yFormat=" >-.2f"
          colors={ colors }
          useMesh={true}
          animate={false}
          tooltip={ generateTooltip }
          axisTop={null}
          axisRight={null}
          axisBottom={ axisBottom }
          axisLeft={ axisLeft }
          pointSize={10}
          pointColor={ pointColor }
          pointBorderWidth={2}
          pointBorderColor={ pointBorderColor }
          pointLabelYOffset={-12}
          legends={legends}
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

export default PrismLineChart;
