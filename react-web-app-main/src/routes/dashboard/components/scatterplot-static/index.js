import React, { useCallback, useEffect, useState } from 'react'

import { Dropdown } from 'react-bootstrap'
import Spinner from 'react-spinkit'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'

import { COLOR_SCHEMES } from '../../../../constants'
import ChartTooltip from '../tooltip'
import Modal from 'react-modal';
// import MainTable from '../tabulator'
import ModalTable from '../modal-table'

// import 'react-tabulator/lib/styles.css';
// import 'react-tabulator/css/bootstrap/tabulator_bootstrap.min.css';
// import 'react-tabulator/lib/styles.css';

import './index.css'

const PrismStaticScatterplot = (props) => {

  const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
  };

  var subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);

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

  function allModal(e, node){
    // console.log("E: ", e)
    console.log("node: ", node)
    openModal()
  }



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
            tooltip={ (e) => <ChartTooltip text={e.node.data.y} value={e.node.data.z} /> }
            gridXValues={ props.xVals }
            gridYValues={ props.yVals }
            animate={ false }
            onClick={(node, e) => allModal(e, node)}
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
          <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
            ariaHideApp={false}
          >
            <h2 ref={_subtitle => (subtitle = _subtitle)}>Hello</h2>
            <button onClick={closeModal}>close</button>
            <div>I am a modal</div>
            <ModalTable
              data={[{
      name: 'Leanne Graham',
      email: 'Sincere@april.biz',
      age: 28,
      status: 'Active'
    },
    {
      name: 'Ervin Howell',
      email: 'Shanna@melissa.tv',
      age: 35,
      status: 'Active'
    },
    {
      name: 'Clementine Bauch',
      email: 'Nathan@yesenia.net',
      age: 33,
      status: 'Inactive'
    },
    {
      name: 'Patricia Lebsack',
      email: 'Julianne@kory.org',
      age: 25,
      status: 'Active'
    }]}
              columns={[ {
      Header: 'Year',
      accessor: 'name'
    }, {
      Header: 'Email',
      accessor: 'email'
    }, {
      Header: 'Age',
      accessor: 'age'
    }, {
      Header: 'Status',
      accessor: 'status'
    }]}
            />
          </Modal>
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
