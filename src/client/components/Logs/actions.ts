import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { StoreState } from '../../store/reducers';
import { startLoadingBar, stopLoadingBar } from '../../store/actions';
import { ILogsQuery, ILogsRetVal } from '../../../server/routeHandlers/api/logs';

export const FETCH_LOGS_REQUEST = '@@logs/request';
export const FETCH_LOGS_SUCCESS = '@@logs/success';
export const FETCH_LOGS_ERROR = '@@logs/error';
export interface FetchLogsRequestAction extends Action { subreddit: string; }
export interface FetchLogsSuccessAction extends Action { logs: ILogsRetVal; }
export interface FetchLogsErrorAction extends Action { err: Error; }

const defaultQueryParams: ILogsQuery = {
  limit: 25,
};

export const fetchLogs = (subreddit: string, queryParams: ILogsQuery = defaultQueryParams): ThunkAction<any, StoreState, any> => {
  return async (dispatch, getState) => {
    dispatch({ type: FETCH_LOGS_REQUEST, subreddit });
    dispatch(startLoadingBar());

    try {
      const logs = await getState().app.api.logs(subreddit, queryParams);
      dispatch({ type: FETCH_LOGS_SUCCESS, logs });
    } catch (err) {
      dispatch({ type: FETCH_LOGS_ERROR, err });
    } finally {
      dispatch(stopLoadingBar());
    }
  };
};

export default { fetchLogs };
