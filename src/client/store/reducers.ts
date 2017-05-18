import { combineReducers } from 'redux';
import { loadingBarReducer } from 'react-redux-loading-bar';
import { ISubreddit } from '../../server/models/subreddit/type';
import logsReducer, { ILogsState } from '../components/Logs/reducer';
import { FETCH_SUBREDDITS_FINISH, FetchSubredditsAction } from './actions';
import subredditsApi from '../api/subreddits';
import logsApi from '../api/logs';
import logApi from '../api/log';

export interface AppState {
  fetchingSubreddits: boolean;
  subreddits: ISubreddit[];

  /**
   * during server-rendering, the server injects the actual route handlers here,
   * which accomplishes two things:
   * 1. we can continue to define apiBaseUrl as a relative path, which doesn't work on the server
   * 2. we can avoid an http request from the server to itself
   */
  api: {
    subreddits: typeof subredditsApi,
    logs: typeof logsApi,
    log: typeof logApi,
  };
}

export interface StoreState {
  app: AppState;
  logs: ILogsState;
}

const initialAppState: AppState = {
  fetchingSubreddits: true,
  subreddits: [],

  /**
   * after the serverside render is complete, it will delete state.app.api so we can replace it with
   * our actual api calls with go over the wire.
   */
  api: {
    subreddits: subredditsApi,
    logs: logsApi,
    log: logApi,
  },
};

type Action = FetchSubredditsAction;

export const app = (state: AppState = initialAppState, action: Action): AppState => {
  switch (action.type) {
    case FETCH_SUBREDDITS_FINISH:
      return {
        ...state,
        subreddits: action.subreddits,
        fetchingSubreddits: false,
      };

    default:
      if (!state.api) {
        return {
          ...state,
          api: state.api ? state.api : initialAppState.api,
        };
      }
      return state;
  }
};

export default combineReducers<StoreState>({
  app,
  logs: logsReducer,
  loadingBar: loadingBarReducer,
});
