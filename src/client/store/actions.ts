import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import { StoreState } from './reducers';
import { ISubreddit } from '../../server/models/subreddit/type';

export const FETCH_SUBREDDITS_FINISH = '@@subreddit/finish';
export interface FetchSubredditsAction extends Action { subreddits: ISubreddit[]; }

export const fetchSubreddits = (): ThunkAction<any, StoreState, any> => {
  return (dispatch, getState) => {
    return getState().app.api.subreddits().then(subreddits => {
      dispatch({ type: FETCH_SUBREDDITS_FINISH, subreddits });
      return subreddits;
    });
  };
};

export const startLoadingBar = showLoading;
export const stopLoadingBar = hideLoading;
