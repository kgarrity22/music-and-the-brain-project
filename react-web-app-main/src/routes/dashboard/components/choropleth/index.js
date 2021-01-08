import React, { useCallback, useEffect, useState } from 'react';

import Spinner from 'react-spinkit'
import { ResponsiveChoropleth } from '@nivo/geo'

import ChartTooltip from '../tooltip'
import GeoFeatures from './features.js'
import { COLOR_SCHEMES } from '../../../../constants'
import './index.css'

const legends = [{
    anchor: 'center',
    direction: 'column',
    justify: false,
    translateX: 600,
    translateY: -100,
    itemsSpacing: 0,
    itemWidth: 94,
    itemHeight: 18,
    itemDirection: 'left-to-right',
    itemTextColor: '#444444',
    itemOpacity: 0.85,
    symbolSize: 18,
    effects: [{
      on: 'hover',
      style: {
        itemTextColor: '#000000',
        itemOpacity: 1
      }
    }]
}]

const domain = [0, 300]

const PrismChoropleth = (props) => {

  const [colors, setColors] = useState([])
  useEffect(() => {
    if (props.colors) {
      setColors(COLOR_SCHEMES[props.colors])
    }
  }, [props.colors])

  const generateTooltip = useCallback(
    (e) => {
      return (<ChartTooltip text={e.feature.id} value={e.feature.value} />)
    }, []
  )

  return (
    <div className="choropleth-chart-container">
      <p className="chart-title">{ props.title }</p>
      <div className="chart">
        <ResponsiveChoropleth
          data={ props.chartData }
          features={ GeoFeatures.features }
          colors={ colors }
          domain={ domain }
          unknownColor="#dddddd"
          label="properties.name"
          projectionType='naturalEarth1'
          projectionScale={ 200 }
          valueFormat=".0s"
          enableGraticule={ true }
          graticuleLineColor="#dddddd"
          borderWidth={ 0.5 }
          borderColor="#152538"
          isInteractive={ true }
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

export default PrismChoropleth;
