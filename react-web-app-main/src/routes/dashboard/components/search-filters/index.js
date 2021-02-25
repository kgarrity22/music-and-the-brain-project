import React, { useState } from 'react'
import {
  Button,
  Form
} from 'react-bootstrap'

import './index.css'


function SearchFilterSection(props) {

  const [titleIsChecked, setTitleIsChecked] = useState(true)

  const onTitleSectionClicked = () => {

    setTitleIsChecked(!titleIsChecked)
    // console.log("title is checked: ", titleIsChecked)
    for (let filter in props.filters){
      //console.log("filter of props.filters; ", filter)
      //console.log("titleIsChecked: ", titleIsChecked)
      if (props.filters[filter] === titleIsChecked) {
        props.onFilterClicked(props.title, filter, false)
      }
    }
  }

  const titleIsIndeterminate = () => {
    let falseCount = 0;
    let trueCount = 0;
    for (let filter in props.filters){
      if (props.filters[filter] === true){
        trueCount = trueCount + 1;
      } else if (props.filters[filter] === false){
        falseCount = falseCount + 1;
      }
    }
    return (falseCount > 0 && trueCount > 0);
  }

  return (
    <div className="search-filter-section">
        <Form.Group className={"checkbox-group title-checkbox-group " + props.color}>
          <Form.Check type="checkbox" custom>
            <Form.Check.Input
              type="checkbox"
              isValid
              checked={titleIsChecked}
              onClick={() => onTitleSectionClicked()}
              id={props.title + "-title-checkbox"}
              readOnly
              ref={input => {
                if (input) {
                  input.checked = titleIsChecked;
                  input.indeterminate = titleIsIndeterminate();
                }
              }}
            />
            <Form.Check.Label htmlFor={props.title + "-title-checkbox"}>
              <Button variant="link" onClick={() => props.onTitleSectionClicked()}>{props.title}</Button>
            </Form.Check.Label>
          </Form.Check>
        </Form.Group>
      <div className="search-filters-container">
        {
          Object.keys(props.filters).map((filter, index) => (
              <Form.Group key={index} className={"checkbox-group " + props.color + " " + (props.activeFilter === filter ? 'active' : '')}
                onMouseEnter={props.onFilterHover ? (e) => props.onFilterHover(filter) : null}
                onMouseLeave={props.onFilterUnHover ? (e) => props.onFilterUnHover(filter) : null}
              >
                <Form.Check type="checkbox" custom>
                  <Form.Check.Input
                    type="checkbox"
                    isValid
                    checked={props.filters[filter]}
                    onClick={
                      function(e){
                        //console.log("props.title: ", props.title, filter, props.filters)
                        return props.onFilterClicked(props.title, filter, props.subCategory)
                      }
                    }
                    id={filter + props.title + "-checkbox"}
                    readOnly
                  />
                  <Form.Check.Label htmlFor={filter + props.title + "-checkbox"}>
                    <Button variant="link" onClick={(e) => props.onFilterLabelClicked(props.title, filter, props.subCategory)}>{filter}</Button>
                  </Form.Check.Label>
                </Form.Check>
              </Form.Group>
          ))
        }
      </div>
    </div>
  )
}


function SearchFilters(props) {

  const colors = {
    'Studies': 'red',
    'Populations': 'orange',
    'Interventions': 'yellow',
    'Outcomes': 'green',
    'Conditions': 'blue',
    'Geography': 'indigo',
  }
  // console.log("props.sections: ", Object.keys(props.sections))
  // Object.keys(props.sections).map((key, index) => (
  //
  //     console.log("key: ", key)
  //     console.log("index: ", index)
  // ))

  return (
    <Form className='search-filters-form '>
      {
        Object.keys(props.sections).map((key, index) => (

            <SearchFilterSection
              key={index}
              filters={props.sections[key]}
              title={key}
              filterIndex={index}
              color={colors[props.activeCategory]}
              onFilterClicked={props.onFilterClicked}
              onFilterLabelClicked={props.onFilterLabelClicked}
              activeFilter={props.activeFilter}
              onFilterHover={props.onFilterHover}
              onFilterUnHover={props.onFilterUnHover}
            />
        ))
      }
    </Form>
  )
}

export default SearchFilters;
