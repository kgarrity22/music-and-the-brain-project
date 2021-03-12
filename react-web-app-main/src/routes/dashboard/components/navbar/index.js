import React from 'react'
import { Button, Nav } from 'react-bootstrap'
import { FiActivity, FiDollarSign, FiMap, FiRefreshCcw, FiGrid, FiMusic} from 'react-icons/fi'
import { BsPeople } from 'react-icons/bs'
import { CgPill } from 'react-icons/cg'
import { RiMentalHealthLine } from 'react-icons/ri'

import './index.css'


function CanvasIcon(props) {
  return (
    <svg width="30" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z" fill="white"/>
    </svg>
  )
}


function Navbar(props) {

  const tabs = [
    {
      icon: <FiGrid />,
      title: 'Studies',
      activeColor: 'red'
    },
    {
      icon: <BsPeople />,
      title: 'Populations',
      activeColor: 'orange'
    },
    {
      icon: <FiMusic />,
      title: 'Interventions',
      activeColor: 'yellow'
    },
    {
      icon: <FiActivity />,
      title: 'Outcomes',
      activeColor: 'green'
    },
    {
      icon: <RiMentalHealthLine />,
      title: 'Conditions',
      activeColor: 'blue'
    },
    {
      icon: <FiMap />,
      title: 'Geography',
      activeColor: 'indigo'
    }
  ]

  return (
    <Nav className="filter-nav">
      <div className="header-container">
        <CanvasIcon />
        <p>Music & Mental Illness
          <br />
          Landscape
        </p>
      </div>

      <div className='nav-item-container'>
        <h4>Filters</h4>
        {
          tabs.map((tab, index) => (
            <Nav.Item key={index}>
              <Nav.Link
                href="#"
                className={props.activeTab === tab.title ? tab.activeColor : ''}
                onClick={(e) => props.onNavItemClicked(e, tab.title)}
              >
                {tab.icon} {tab.title}
              </Nav.Link>
            </Nav.Item>
          ))
        }

        <Button onClick={(e) => props.onUpdateButtonClicked(e)}><FiRefreshCcw /> Update</Button>

      </div>
    </Nav>
  )
}

export default Navbar;
