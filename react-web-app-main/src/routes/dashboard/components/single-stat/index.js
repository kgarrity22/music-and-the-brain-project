import React from 'react'
import Spinner from 'react-spinkit'

import './index.css'


function SingleStat(props) {
  //console.log('props in single stat: ', props.stats)

  return (
    <div className={'single-stats-container  ' + props.color}>
      {
        props.stats.map((stat, index) => (
          <div key={index} className="single-stat-container">
            <div className='single-stat'>
              <p className='stat-title'>{stat.title}</p>
              <p className='stat-metric'>{stat.metric}</p>
            </div>
            {
              index !== (props.stats.length -1) &&
              <div className="stat-divider"></div>
            }
          </div>
        ))
      }
      {
        props.loading &&
        <div className="overlay">
          <Spinner name="ball-beat" color={props.color} />
        </div>
      }
    </div>
  )
}

export default SingleStat;
