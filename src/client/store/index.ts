import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import * as reduxLogger from 'redux-logger';
import reducers, { StoreState, initialAppState } from './reducers';

let preloadedState;

try {
  const tag = document.getElementById('preloadedState');
  preloadedState = JSON.parse(tag.getAttribute('content')) as StoreState;

  // during SSR state.app.api contains actual server-side functions.
  // on the client, replace them with api calls that go over the network.
  // since SSR populates the initial state, the actual initial state from the resolver never gets picked up,
  // so we have to manually replace the functions here.
  preloadedState.app.api = initialAppState.api;

  if (process.env.NODE_ENV !== 'development') tag.remove();
} catch (e) {
  preloadedState = {};
}

const logger = reduxLogger.createLogger({
  predicate: () => process.env.NODE_ENV === 'development',
  collapsed: true,
});

const store = createStore(
  reducers,
  preloadedState,
  applyMiddleware(thunk, logger)
);

export default store;
