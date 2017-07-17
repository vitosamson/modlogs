import '../ignoreStyleImports';

import { resolve } from 'path';
import { readFileSync } from 'fs';
import * as React from 'react';
import * as express from 'express';
import { renderToString } from 'react-dom/server';
import { createStore, applyMiddleware, Store } from 'redux';
import thunk from 'redux-thunk';
import { match } from 'react-router';
import { loadPropsOnServer } from 'async-props';
import 'isomorphic-fetch';

import appReducer, { StoreState } from '../../client/store/reducers';
import { initialState as initialLogsState } from '../../client/components/Logs/reducer';
import Root from '../../client/containers/Root';
import routes from '../../client/routes';

import { subreddits as subredditsHandler } from './api/subreddits';
import { logs as logsHandler, ILogsQuery } from './api/logs';
import { log as logHandler } from './api/log';
import { AuthenticatedRequest } from './modLoginMiddleware';

const htmlTplFilePath = resolve('build/client/index.tpl.html');
const htmlTpl = readFileSync(htmlTplFilePath).toString();

interface LoadedProps {
  asyncProps: any;
  scriptTag: string;
}

export default async function renderUi(req: AuthenticatedRequest, res: express.Response) {
  match({ routes, location: req.url }, async (error, redirectLocation, renderProps) => {
    if (error) {
      res.status(500).send(error.message);
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      const initialState: StoreState = {
        logs: initialLogsState,
        app: {
          fetchingSubreddits: false,
          subreddits: [],
          isAuthenticatedMod: req.__isAuthenticatedMod,
          username: req.__user,
          api: {
            subreddits: subredditsHandler,
            logs: (subredditName: string, query: ILogsQuery) =>
              logsHandler(subredditName, query, req.__isAuthenticatedMod),
            log: (subredditName: string, redditLogId: string) =>
              logHandler(subredditName, redditLogId, req.__isAuthenticatedMod),
          },
        },
      };
      const store = createStore<StoreState>(appReducer, initialState, applyMiddleware(thunk));
      const { asyncProps, scriptTag } = await loadProps(renderProps, store);
      const html = renderToString(<Root store={store} routerProps={renderProps} asyncProps={asyncProps} />);
      const finalState = store.getState();

      delete finalState.app.api;

      res.send(renderFullPage(html, finalState, scriptTag));
    } else {
      res.status(404).send('Not found');
    }
  });
}

function loadProps(renderProps: any, store: Store<any>): Promise<LoadedProps> {
  return new Promise<LoadedProps>((resolve, reject) => {
    loadPropsOnServer(renderProps, { dispatch: store.dispatch, location: renderProps.location }, (err, asyncProps, scriptTag) => {
      if (err) return reject(err);
      resolve({ asyncProps, scriptTag });
    });
  });
}

function renderFullPage(html: string, preloadedState: object, asyncPropsScriptTag: string) {
  return htmlTpl.replace(
    '__preloaded_state__',
    JSON.stringify(preloadedState).replace(/'/g, '&apos;')
  ).replace('__rendered_html__', html).replace('__async_props_script__', asyncPropsScriptTag);
}
