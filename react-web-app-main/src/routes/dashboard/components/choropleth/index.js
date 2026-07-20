import React, { useCallback, useEffect, useState } from 'react';

import Spinner from 'react-spinkit'
import { ResponsiveChoropleth } from '@nivo/geo'

import ChartTooltip from '../tooltip'
import GeoFeatures from './features.js'
import { COLOR_SCHEMES } from '../../../../constants'

import Modal from 'react-modal';
import MainTable from '../tabulator'


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

// Fallback only — the dashboard passes a domain scaled to the actual data.
const defaultDomain = [0, 300]

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

  var subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);
  const [allTableData, setAllTableData] = useState([])
  // const [tables, setTables] = useState([])
  const [modalTitle, setModalTitle] = useState("")

  function openModal() {
    setIsOpen(true);
  }


  function closeModal() {
    setIsOpen(false);
  }

  function allModal(data, title) {

    let tabledata = data[title]

    console.log("TABLE DATA: ", tabledata)
    setAllTableData(tabledata)
    setModalTitle(title)
    openModal()
  }

  return (
    <div className="choropleth-chart-container">
      <p className="chart-title">{ props.title }</p>
      <div className="chart">
        <ResponsiveChoropleth
          data={ props.chartData }
          features={ GeoFeatures.features }
          colors={ colors }
          domain={ props.domain || defaultDomain }
          unknownColor="#dddddd"
          label="properties.name"
          projectionType='naturalEarth1'
          projectionScale={ 200 }
          valueFormat=".0f"
          enableGraticule={ true }
          graticuleLineColor="#dddddd"
          borderWidth={ 0.5 }
          borderColor="#152538"
          isInteractive={ true }
          tooltip={ generateTooltip }
          legends={ legends }
          formattedData={props.formattedData}
          onClick={(data) => {
            // console.log("DATA: ", data)
            allModal(props.formattedData, data.id)
          }}
        />
      </div>
      <div className="scatter-modal">
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Example Modal"
          ariaHideApp={false}
          className="Modal"
        >
          <h2 ref={_subtitle => (subtitle = _subtitle)}>{modalTitle}</h2>
          <button className="close-btn" onClick={closeModal}>close</button>
          <div className="tableholder">
            <MainTable
              tabledata={allTableData}
              height={300}
              columns={props.columns}
            />
          </div>
        </Modal>
      </div>
      {
        props.loading &&
        <div className="overlay">
          {/* Darkest end of the scale — this chart uses a sequential palette
              whose first entry is near-white and would vanish on the overlay. */}
          <Spinner name="ball-beat" color={colors[colors.length - 1]} />
        </div>
      }
    </div>
  )
}

export default PrismChoropleth;
