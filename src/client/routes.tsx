import * as React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';
import App from './containers/App';
import LogsContainer from './containers/Logs';
import Logs from './components/Logs';
import LogPermalink from './components/Logs/LogPermalink';

export default (
  <Route path="/" component={App}>
    <Route path="r/:subreddit" component={LogsContainer}>
      <IndexRoute component={Logs} />
      <Route path="log/:permalinkId" component={LogPermalink} />
    </Route>
    <Redirect from="*" to="/" />
  </Route>
);
