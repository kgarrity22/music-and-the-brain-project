import React from 'react';
import { Form, InputGroup } from 'react-bootstrap'
import './index.css';

function TextInputGroup(props) {
    return (
        <Form.Group controlId={props.controlId}>
            <Form.Label>{props.label}</Form.Label>
                <InputGroup className="mb-2">
                    <Form.Control
                      type={props.inputType}
                      placeholder={props.placeholder}
                      disabled={props.disabled}
                      value={props.value}
                      onChange={props.onChange ? e => props.onChange(e.target.value) : null}
                    />
                    <InputGroup.Prepend>
                        <InputGroup.Text>{props.icon}</InputGroup.Text>
                    </InputGroup.Prepend>
                </InputGroup>
        </Form.Group>


    )
}

export default TextInputGroup
