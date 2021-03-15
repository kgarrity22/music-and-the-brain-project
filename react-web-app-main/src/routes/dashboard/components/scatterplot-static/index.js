import React, { useCallback, useEffect, useState } from 'react'

import { Dropdown } from 'react-bootstrap'
import Spinner from 'react-spinkit'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'

import { COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'
import LandscapeTooltip from '../landscape-tooltip'
import Modal from 'react-modal';
import MainTable from '../tabulator'
import ModalTable from '../modal-table'
import './index.css'




const PrismStaticScatterplot = (props) => {



  var subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);
  const [allTableData, setAllTableData] = useState([])
  const [tables, setTables] = useState([])
  const [modalTitle, setModalTitle] = useState("")

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = '#f00';
  }

  function closeModal(){
    setIsOpen(false);
  }



  function allModal(node){
    console.log("NODE: ", node)
    //console.log("type: ", typeof(node.data.formattedX))
    let title=""
    if (typeof(node.data.formattedX)==='object'){
      let x = String(node.data.x)
      title = x.slice(4, 15) + " x " + node.data.y
    } else {
      title = node.data.x + " x " + node.data.y
    }
    let alltables = []
    //console.log("CHECKING: ", node.data.all)
    let complete = node.data.all


    setAllTableData(alltables)
    let table = []
    for (let item of Object.keys(complete)){
      console.log("complete[item]: ", complete)
      table.push(<div>
          <h3>{item}</h3>
          <MainTable tabledata={ complete[item] } height={"auto"} />
        </div>
      )
    }
    console.log(table)
    setTables(table)
    setModalTitle(title)
    openModal()
  }
    // const allModal = (node) => {
    //
    //   // const res = await getTableData(node)
    //   // console.log("All DATA Fetching?: ", res)
    //   setAllTableData([])
    //   setModalTitle(node.data.y)
    //   openModal()
    //
    // }

  // function allModal(e, node){
  //   console.log("E: ", e)
  //   console.log("node: ", node)
  //   openModal()
  // }


//<ChartTooltip text={e.node.data.y} value={e.node.data.z} />

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

            height={800}
            margin={{ top: 70, right: 300, bottom: props.marginBottom, left: 200 }}

            xScale={{ type: props.type, format: props.format, precision: props.precision, min: props.xMin, max: props.xMax  }}
            xFormat={ props.xFormat }
            yScale={{ type: 'point' }}
            blendMode="multiply"
            colors={ COLOR_SCHEMES['rainbow'] }
            nodeSize={{ key: 'z', values: [props.minNodeSize, props.maxNodeSize], sizes: [10, 150] }}

            tooltip={ function(e) {
              //console.log("Tooltip E: ", e.node.data);
              return <LandscapeTooltip all={e.node.data} />} }
            gridXValues={ props.xVals }
            gridYValues={ props.yVals }
            useMesh={true}
            animate={ false }
            onClick={(node, e) => allModal(node)}
            axisTop={ null }
            axisRight={ null }
            axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: null,
                format: props.axisBottomFormat,
                tickValues: props.tickValues,


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
              translateX: 200,
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
          <div className="scatter-modal">
          <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
            ariaHideApp={false}
            className="Modal"
          >
            <h2 ref={_subtitle => (subtitle = _subtitle)}>{modalTitle}</h2>
            <button className="close-btn" onClick={closeModal}>close</button>

            <div className="tableholder">
              {tables}
            </div>

          </Modal>
          </div>

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
