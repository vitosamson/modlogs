import '../ignoreStyleImports';

import { resolve } from 'path';
import { readFileSync } from 'fs';
import * as React from 'react';
import * as express from 'express';
import { renderToNodeStream } from 'react-dom/server';
import { createStore, applyMiddleware, Store } from 'redux';
import thunk from 'redux-thunk';
import { match } from 'react-router';
import { loadPropsOnServer } from 'async-props';
import 'isomorphic-fetch';

import appReducer, { StoreState } from '../../client/store/reducers';
import { initialState as initialLogsState } from '../../client/components/Logs/reducer';
import Html, { Props as HtmlProps } from '../../client/containers/Html';
import Root from '../../client/containers/Root';
import routes from '../../client/routes';

import { subreddits as subredditsHandler } from './api/subreddits';
import { logs as logsHandler, ILogsQuery } from './api/logs';
import { log as logHandler } from './api/log';
import { AuthenticatedRequest } from './modLoginMiddleware';

const clientAssets = JSON.parse(readFileSync(resolve('build/client/assets.json')).toString()) as HtmlProps;

interface LoadedProps {
  asyncProps: any;
  scriptTag: string;
}

export default async function renderUi(req: AuthenticatedRequest, res: express.Response) {
  res.setHeader('content-type', 'text/html');

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

      const finalState = store.getState();
      delete finalState.app.api;

      const { webpackManifest, cssHref, vendorScriptHref, appScriptHref } = clientAssets;

      renderToNodeStream(
        <Html
          webpackManifest={webpackManifest}
          cssHref={cssHref}
          vendorScriptHref={vendorScriptHref}
          appScriptHref={appScriptHref}
          asyncPropsScriptTag={scriptTag}
          preloadedState={JSON.stringify(finalState)}
        >
          <Root store={store} routerProps={renderProps} asyncProps={asyncProps} />
        </Html>
      ).pipe(res);
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
