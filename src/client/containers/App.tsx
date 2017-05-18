import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import LoadingBar from 'react-redux-loading-bar';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchSubreddits } from '../store/actions';
import { LoadPropsArgs, LoadPropsCb } from '../types';

interface Params {
  subreddit?: string;
}

interface Props {
  children?: any;
}

type AppProps = Props & RouteComponentProps<Params, any>;

export default class App extends React.Component<AppProps, null> {
  public static loadProps({ loadContext: { dispatch } }: LoadPropsArgs<void>, cb: LoadPropsCb) {
    dispatch(fetchSubreddits()).then(() => cb(null)).catch(cb);
  }

  private changeSubreddit = (subreddit: string) => {
    const { params, router } = this.props;
    if (subreddit === params.subreddit) return;
    router.push({
      pathname: `/r/${subreddit}`,
    });
  }

  public render() {
    const { children, params } = this.props;

    return (
      <div className="app-container">
        <Header currentSubreddit={params.subreddit} onSelectSubreddit={this.changeSubreddit} />
        <LoadingBar
          showFastActions={true}
          style={{
            backgroundColor: '#446CB3',
          }}
        />
        { children }
        <Footer subreddit={params.subreddit} />
      </div>
    );
  }
}
