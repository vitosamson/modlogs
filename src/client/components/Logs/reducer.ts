import { ILog } from '../../../server/models/log/type';
import {
  FETCH_LOGS_REQUEST,
  FETCH_LOGS_SUCCESS,
  FETCH_LOGS_ERROR,
  FetchLogsRequestAction,
  FetchLogsSuccessAction,
  FetchLogsErrorAction,
} from './actions';

export interface ILogsState {
  before: string | null;
  after: string | null;
  logs: ILog[];
  fetching: boolean;
  subreddit: string | null;
  limit: string;
}

type Action = FetchLogsRequestAction & FetchLogsSuccessAction & FetchLogsErrorAction;

export const initialState: ILogsState = {
  before: null,
  after: null,
  logs: [],
  fetching: false,
  subreddit: null,
  limit: '25',
};

export default (state: ILogsState = initialState, action: Action): ILogsState => {
  switch (action.type) {
    case FETCH_LOGS_REQUEST:
      return {
        ...state,
        fetching: true,
        subreddit: action.subreddit,
      };

    case FETCH_LOGS_SUCCESS:
      return {
        ...state,
        fetching: false,
        logs: action.logs.logs,
        before: action.logs.before,
        after: action.logs.after,
      };

    case FETCH_LOGS_ERROR:
      return {
        ...state,
        fetching: false,
      };

    default: return state;
  }
};
