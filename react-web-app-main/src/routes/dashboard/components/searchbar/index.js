import React from 'react'
import { Form } from 'react-bootstrap'

import { FiBell, FiSearch } from 'react-icons/fi'

import './index.css'

function Searchbar(props) {

  return (
    <Form.Group className="searchbar-form">
      <FiSearch />
      <Form.Control type="text" placeholder="Global search" />
      <FiBell />
    </Form.Group>
  )
}

export default Searchbar;
