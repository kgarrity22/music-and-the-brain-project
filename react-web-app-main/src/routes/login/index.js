import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Container } from "react-bootstrap";
import { Redirect, withRouter } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { FiKey, FiMail } from 'react-icons/fi'

import TextInputGroup from './components/text-input-group'

import "./index.css";


function LoginRoute(props) {

  const [currentUser, setCurrentUser] = useState("")

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSignInClicked = async () => {
      try {
          const user = await Auth.signIn(email, password);
          setCurrentUser(user)
      } catch (error) {
          console.log('error signing in', error);
      }
  }

  useEffect((props) => {
    const getCurrentAuthenticatedUser = async () => {
      try {
          const user = await Auth.currentAuthenticatedUser()
          setCurrentUser(user)
      } catch (error) {
      }
    }
    getCurrentAuthenticatedUser()
  }, [currentUser])

  if (currentUser !== undefined && currentUser !== "") {
    return <Redirect to="/" />
  }

  return (
    <Container fluid className="login">
      <Row noGutters={true} className="login-container-row">
        <Col lg={{ offset: 3, span: 6 }} className="login-container d-flex">
          <Row>
            <Col className="logo-col" sm={{offset:0}} lg={{ offset: 3 }}>
              <img alt="logo" src="/images/logo.png" className="login-logo" />
            </Col>
          </Row>
          <Row>
            <Col>
              <Form>
                <Form.Row>
                  <Col lg={{ span: 10, offset: 1 }}>
                    <TextInputGroup label="Email" icon={<FiMail />} onChange={setEmail} />
                  </Col>
                </Form.Row>
                <Form.Row>
                  <Col lg={{ span: 10, offset: 1 }}>
                    <TextInputGroup label="Password" inputType="password" icon={<FiKey />} onChange={setPassword} />
                  </Col>
                </Form.Row>
                <Form.Row>
                  <Col>
                    <Row>
                      <Col lg={{ span: 10, offset: 1 }}>
                        <Button onClick={onSignInClicked}>Log In</Button>
                      </Col>
                    </Row>
                  </Col>
                </Form.Row>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default withRouter(LoginRoute);
