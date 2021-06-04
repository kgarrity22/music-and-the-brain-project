import React, { useCallback, useEffect, useState } from 'react'

import Spinner from 'react-spinkit'
import { ResponsivePie } from '@nivo/pie'

import { COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'
import Modal from 'react-modal';
import MainTable from '../tabulator'


import './index.css'

const intialLegends = [{
  anchor: 'left',
  direction: 'column',
  justify: false,
  translateX: 0,
  translateY: 0,
  itemsSpacing: 5,
  itemWidth: 80,
  itemHeight: 12,
  itemTextColor: '#999',
  itemDirection: 'left-to-right',
  itemOpacity: 1,
  symbolSize: 12,
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

  let subtitle
  const [modalIsOpen, setIsOpen] = useState(false);
  const [allTableData, setAllTableData] = useState([])
  // const [tables, setTables] = useState([])
  const [modalTitle, setModalTitle] = useState("")

  function openModal() {
    setIsOpen(true);
  }


  function closeModal(){
    setIsOpen(false);
  }

  function allModal(data, title){

    // let tabledata = data

    console.log("TABLE DATA: ", data)
    setAllTableData(data)
    setModalTitle(title)
    openModal()
  }
  let options = {

    // height: 600,
    placeholder: "Loading Data...",
    downloadDataFormatter: (data) => data,
    downloadReady: (fileContents, blob) => blob,
    resizable:false,
    virtualDomBuffer:600,
    tooltips:true,

  };

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
          onClick={(data) => {
            console.log("DATA: ", data)
            setAllTableData(data.data.key)
            setModalTitle(data.data.id)
            openModal()
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
              tabledata={ allTableData }
              height={300}
              columns={props.columns}
            />
          </div>
        </Modal>
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
