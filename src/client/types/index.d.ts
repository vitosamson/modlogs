import { Dispatch } from 'redux';
import { Location } from 'history';
import { StoreState } from '../store/reducers';

export interface LoadPropsArgs<ExpectedParams> {
  params: ExpectedParams;
  loadContext: {
    dispatch: (...args: any[]) => Promise<any>;
    location: Location;
  };
}

export type LoadPropsCb = (err: Error | null, props?: any) => void;

declare global {
  interface Window {
    ga?: (...args: any[]) => void;
  }
}
