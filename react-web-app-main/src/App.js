import React from 'react';

import Amplify from 'aws-amplify';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from "react-router-dom";

import DashboardRoute from '../src/routes/dashboard'
// import LoginRoute from '../src/routes/login'

import config from './config/aws-config'
import './App.css';

// Amplify.configure({
//   Auth: {
//     mandatorySignIn: true,
//     region: config.cognito.REGION,
//     userPoolId: config.cognito.USER_POOL_ID,
//     userPoolWebClientId: config.cognito.APP_CLIENT_ID
//   }
// });

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <DashboardRoute />
        </Route>
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}


export default App;
