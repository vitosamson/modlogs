import * as React from 'react';
import ExternalLink from './ExternalLink';
import './footer.scss';

interface Props {
  subreddit: string;
}

export default class Footer extends React.PureComponent<Props, null> {
  public render() {
    let content = null;

    if (!this.props.subreddit) {
      content = (
        <div className="no-subreddit">
          <p>Mod Logs allows subreddits to opt in to providing transparency to their moderation.</p>
          <p>Get started by selecting a subreddit from the dropdown above.</p>
          <p>
            If you're a moderator and want to use Mod Logs in your subreddit, check out the <a href="#">Moderator Help</a>.
          </p>
        </div>
      );
    }

    return (
      <footer>
        { content }

        <div className="links">
          <ExternalLink to="public_moderator_log" type="user">
            /u/public_moderator_log
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
