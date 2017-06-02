import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import LoadingBar from 'react-redux-loading-bar';
import { StickyContainer, Sticky } from 'react-sticky';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchSubreddits } from '../store/actions';
import { LoadPropsArgs, LoadPropsCb } from '../types';
import { initAnalytics, trackPage } from '../analytics';

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

  public componentDidMount() {
    initAnalytics();
  }

  private changeSubreddit = (subreddit: string) => {
    const { params, router } = this.props;
    if (subreddit === params.subreddit) return;
    const nextPath = `/r/${subreddit}`;
    router.push({
      pathname: nextPath,
    });
    trackPage(nextPath);
  }

  public render() {
    const { children, params } = this.props;

    return (
      <StickyContainer className="app-container">
        <Header currentSubreddit={params.subreddit} onSelectSubreddit={this.changeSubreddit} />
        <Sticky topOffset={43}>
          {({ style }: { style: any }) => {
            delete style.width; // don't let sticky override the loader's width

            return (
              <LoadingBar
                showFastActions={true}
                style={{
                  ...style,
                  zIndex: 10,
                  backgroundColor: '#0397c3',
                }}
              />
            );
          }}
        </Sticky>
        { children }
        <Footer />
      </StickyContainer>
    );
  }
}
