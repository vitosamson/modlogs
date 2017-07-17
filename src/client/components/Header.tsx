import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Option } from 'react-select';
import Select from './Select';
import { AppState } from '../store/reducers';
import './header.scss';

interface Props {
  currentSubreddit?: string;
  onSelectSubreddit: (subreddit: string) => void;
  loading?: boolean;
  currentPath: string;
}

class Header extends React.PureComponent<Props & AppState, null> {
  public render() {
    const { subreddits, currentSubreddit, onSelectSubreddit, loading, username, currentPath } = this.props;
    const subredditOptions = subreddits.sort((a, b) =>
      a.nameLowercase.localeCompare(b.nameLowercase)
    ).map(sub => ({
      label: sub.name,
      value: sub.nameLowercase,
    }));

    // TODO: we don't have access to location.host in SSR
    let host;
    let authRedirectUrl;
    try {
      host = location.host;
      authRedirectUrl = encodeURIComponent(`https://${host}${currentPath}`);
    } catch (e) {
      host = '';
      authRedirectUrl = '';
    }

    return (
      <header>
        <h1 className="name">
          <Link to="/">Mod Logs</Link>
        </h1>

        <div className="subreddit-selector">
          <Select
            options={subredditOptions}
            value={(currentSubreddit || '').toLowerCase()}
            placeholder="Select a subreddit"
            valueRenderer={opt => <span>/r/{opt.label}</span>}
            clearable={false}
            onChange={(opt: Option) => onSelectSubreddit(opt.label)}
            id="subreddit-selector"
            disabled={loading}
          />
        </div>

        <ul className="links">
          <li className="mod-login">
            { username ?
              <a href={`https://login.${host}/logout?success=${authRedirectUrl}&failure=${authRedirectUrl}`}>
                { username }
                <i className="fa fa-sign-out" />
              </a>
              :
              <a href={`https://login.${host}/?success=${authRedirectUrl}&failure=${authRedirectUrl}`}>
                Moderator Login
              </a>
            }
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
