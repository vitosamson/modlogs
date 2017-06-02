import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import * as reduxLogger from 'redux-logger';
import reducers from './reducers';

let preloadedState;

try {
  const tag = document.getElementById('preloadedState');
  preloadedState = JSON.parse(tag.getAttribute('content'));

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
