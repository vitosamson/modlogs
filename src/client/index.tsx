import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Root from './containers/Root';
import store from './store';
import './styles/main.scss';

ReactDOM.render(<Root store={store} />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
