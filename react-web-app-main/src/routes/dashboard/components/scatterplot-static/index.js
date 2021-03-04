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


// import 'react-tabulator/lib/styles.css';
// import 'react-tabulator/css/bootstrap/tabulator_bootstrap.min.css';
// import 'react-tabulator/lib/styles.css';

var Airtable = require('airtable');
var base = new Airtable({apiKey: 'key8POUQgTG9Ubm4J'}).base('appE1OLuKp1Aq9dRl');

// const customStyles = {
//   content : {
//     top                   : '50%',
//     left                  : '10%',
//     right                 : 'auto',
//     bottom                : 'auto',
//     marginRight           : '-50%',
//     transform             : 'translate(-50%, -50%)'
//   }
// };

const PrismStaticScatterplot = (props) => {



  var subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);
  const [allTableData, setAllTableData] = useState([])
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

  // function getTableData(node){
  //   //console.log("getTableData")
  //       // var Airtable = require('airtable');
  //       // var base = new Airtable({apiKey: 'keygbNFWvzaP9t8xi'}).base('appmh47tLfNhe7i80');
  //
  //         let id = node.data.clickId
  //         var table_data = []
  //
  //       return new Promise((resolve, reject) => {
  //         base('Studies').select({
  //
  //             view: "Grid view"
  //         }).eachPage(function page(records, fetchNextPage) {
  //
  //             records.forEach(function(record) {
  //               if (String(record.get('Covidence_ID'))===id){
  //                 table_data.push(record.fields)
  //               }
  //
  //             });
  //             fetchNextPage();
  //         }, function done(err) {
  //             if (err) {
  //               console.error(err);
  //               return reject({});
  //             }
  //
  //             resolve(table_data)
  //         })
  //       })
  //   }

  function allModal(node){
    console.log("NODE: ", node)
    console.log("type: ", typeof(node.data.formattedX))
    let title=""
    if (typeof(node.data.formattedX)==='object'){
      let x = String(node.data.x)
      title = node.data.serieId + ": " + x.slice(4, 15) + " x " + node.data.y
    } else {
      title = node.data.serieId + ": " + node.data.x + " x " + node.data.y
    }
    setAllTableData(node.data.all)
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
            height={props.chartHeight}
            margin={{ top: 100, right: 300, bottom: 200, left: 200 }}
            xScale={{ type: props.type, format: props.format, precision: props.precision, min: props.xMin, max: props.xMax  }}
            xFormat={ props.xFormat }
            yScale={{ type: 'point' }}
            blendMode="multiply"
            colors={ COLOR_SCHEMES['rainbow'] }
            nodeSize={{ key: 'z', values: [props.minNodeSize, props.maxNodeSize], sizes: [10, 150] }}

            tooltip={ function(e) {
              //console.log("Tooltip E: ", e.node.data);
              return <LandscapeTooltip all={e.node.data.all} />} }
            gridXValues={ props.xVals }
            gridYValues={ props.yVals }
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

            <div className="tableholder">
              <MainTable
                tabledata={allTableData}
                height={"auto"}
                />
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
