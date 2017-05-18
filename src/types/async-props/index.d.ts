declare module 'async-props' {
  import * as React from 'react';

  export interface AsyncPropsProps {
    loadContext: object;
    [key: string]: any;
  }

  interface LoadPropsOnServerOptions {
    components: React.Component<any, any>[];
    params: any;
  }

  interface LoadContext {
    [key: string]: any;
  }

  type LoadPropOnServerCB = (err: Error, asyncProps: object, scriptTag: string) => void;

  export default class AsyncProps extends React.Component<AsyncPropsProps, {}> {}

  export function loadPropsOnServer(
    opts: LoadPropsOnServerOptions,
    loadContext: LoadContext,
    cb: LoadPropOnServerCB
  ): void;
}
