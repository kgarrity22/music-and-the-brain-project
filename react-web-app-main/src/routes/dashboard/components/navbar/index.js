import React from 'react'
import { Button, Nav } from 'react-bootstrap'
import { FiActivity, FiCpu, FiDollarSign, FiList, FiMap, FiPackage, FiRefreshCcw } from 'react-icons/fi'
import { RiLayoutMasonryFill } from 'react-icons/ri'

import './index.css'


function WatchIcon(props) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26.6666 16C26.6666 12.6133 25.08 9.58667 22.6133 7.64L21.3333 0H10.6666L9.39998 7.64C6.91998 9.58667 5.33331 12.6 5.33331 16C5.33331 19.4 6.91998 22.4133 9.39998 24.36L10.6666 32H21.3333L22.6133 24.36C25.08 22.4133 26.6666 19.3867 26.6666 16ZM7.99998 16C7.99998 11.5867 11.5866 8 16 8C20.4133 8 24 11.5867 24 16C24 20.4133 20.4133 24 16 24C11.5866 24 7.99998 20.4133 7.99998 16Z" fill="white"/>
    </svg>
  )
}


function Navbar(props) {

  const tabs = [
    {
      icon: <RiLayoutMasonryFill />,
      title: 'Trials',
      activeColor: 'red'
    },
    {
      icon: <FiCpu />,
      title: 'Populations',
      activeColor: 'orange'
    },
    {
      icon: <FiList />,
      title: 'Interventions',
      activeColor: 'yellow'
    },
    {
      icon: <FiActivity />,
      title: 'Outcomes',
      activeColor: 'green'
    },
    {
      icon: <FiDollarSign />,
      title: 'Sponsors',
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
        <p>
          Alzheimers Canvas
          <br />
          
        </p>
      </div>

      <div className='nav-item-container'>
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
