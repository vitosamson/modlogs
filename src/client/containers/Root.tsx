import * as React from 'react';
import { Router, browserHistory } from 'react-router';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import AsyncProps from 'async-props';
import routes from '../routes';

interface IRootProps {
  store: Store<any>;
  routerProps?: any;
  asyncProps?: any;
}

const Root: React.SFC<IRootProps> = (props: IRootProps) => (
  <AppContainer key={Math.random()}>
    <Provider store={props.store}>
      <Router
        history={browserHistory}
        {...props.routerProps}
        render={
          renderProps => (
            <AsyncProps
              {...renderProps}
              {...props.asyncProps}
              loadContext={{
                dispatch: props.store.dispatch,
                location: renderProps.location,
              }}
            />
          )
        }
      >
        { routes }
      </Router>
    </Provider>
  </AppContainer>
);

export default Root;
