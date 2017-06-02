import * as React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';
import App from './containers/App';
import Home from './components/Home';
import LogsContainer from './containers/Logs';
import Logs from './components/Logs';
import LogPermalink from './components/Logs/LogPermalink';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="r/:subreddit" component={LogsContainer}>
      <IndexRoute component={Logs} />
      <Route path="log/:permalinkId" component={LogPermalink} />
    </Route>
    <Redirect from="*" to="/" />
  </Route>
);
