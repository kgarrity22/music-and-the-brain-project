import React, { useCallback, useEffect, useState } from 'react'

import Spinner from 'react-spinkit'
import { ResponsiveBar } from '@nivo/bar'

import ChartTooltip from '../tooltip'
import { COLORS, COLOR_SCHEMES } from '../../../../constants'

import './index.css'

const PrismTextBlock = (props) => {


  return (
    <div className="text-block-container" style={{"padding-top": props.paddingTop, "padding-bottom": props.paddingBottom}}>
      <h2 className="chart-title">{props.arrow}{props.textTitle}</h2>
      <p className="main-text">{props.mainText}</p>
      <p className="second-p">{props.moreText}</p>
      <p>{props.evenMoreText}</p>

    </div>
  )
}

export default PrismTextBlock;
