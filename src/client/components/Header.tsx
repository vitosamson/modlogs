import * as React from 'react';
import { connect } from 'react-redux';
import Select from './Select';
import { AppState } from '../store/reducers';
import { ISubreddit } from '../../server/models/subreddit/type';
import './header.scss';

interface Props {
  currentSubreddit?: string;
  onSelectSubreddit: (subreddit: string) => void;
  loading?: boolean;
}

class Header extends React.PureComponent<Props & AppState, null> {
  public render() {
    const { subreddits, currentSubreddit, onSelectSubreddit, loading } = this.props;
    const sortedSubreddits = subreddits.sort((a, b) => a.nameLowercase.localeCompare(b.nameLowercase));

    return (
      <header>
        <h1 className="name">Mod Logs</h1>

        <div className="subreddit-selector">
          <Select
            options={sortedSubreddits}
            value={(currentSubreddit || '').toLowerCase()}
            placeholder={loading ? 'loading...' : 'Select a subreddit'}
            valueRenderer={(opt: ISubreddit) => <span>/r/{opt.name}</span>}
            valueKey="nameLowercase"
            labelKey="name"
            clearable={false}
            onChange={(opt: ISubreddit) => onSelectSubreddit(opt.name)}
            id="subreddit-selector"
            disabled={loading}
          />
        </div>

        <ul className="links">
          <li>
            <a href="#">Help</a>
          </li>
        </ul>
      </header>
    );
  }
}

export default connect<AppState, {}, Props>(state => ({
  ...state.app,
  loading: state.app.fetchingSubreddits || state.logs.fetching,
}))(Header);
