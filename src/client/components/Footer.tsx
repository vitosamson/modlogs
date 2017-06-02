import * as React from 'react';
import ExternalLink from './ExternalLink';
import './footer.scss';

export default class Footer extends React.PureComponent<null, null> {
  public render() {
    return (
      <footer>
        <div className="links">
          <ExternalLink to="modlogs" type="user">
            /u/modlogs
          </ExternalLink>

          <span className="separator">|</span>

          <ExternalLink to="https://github.com/vitosamson/modlogs">
            source on github
          </ExternalLink>
        </div>
      </footer>
    );
  }
}
