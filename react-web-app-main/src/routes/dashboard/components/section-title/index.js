import React from 'react'

import './index.css'


function SectionTitle(props) {

  return (
    <div className={"section-title-container " + props.color}>
      <p className="title">{props.title}</p>
    </div>
  )
}

export default SectionTitle;
