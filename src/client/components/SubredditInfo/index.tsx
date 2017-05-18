import * as React from 'react';
import ExternalLink from '../ExternalLink';
import { ISubreddit } from '../../../server/models/subreddit/type';
import mdToHtml from '../../utils/mdToHtml';
import './subreddit-info.scss';

interface Props {
  selectedSubreddit?: string;
  allSubreddits: ISubreddit[];
}

export default class SubredditInfo extends React.PureComponent<Props, null> {
  public render() {
    const { selectedSubreddit, allSubreddits } = this.props;

    const subredditInfo = selectedSubreddit && allSubreddits.find(sub =>
      sub.nameLowercase === selectedSubreddit.toLowerCase(),
    );

    if (!subredditInfo) {
      return null;
    }

    return (
      <div className="panel panel-default subreddit-info">
        <div className="panel-heading">
          <h3 className="panel-title">Subreddit Info</h3>
        </div>
        <div className="panel-body">
          <ul>
            <li>
              <strong>Subscribers: </strong> { subredditInfo.subscribers }
            </li>
            <li>
              <strong>Created: </strong> { new Date(subredditInfo.created).toLocaleDateString() }
            </li>
            <li>
              <strong>Description: </strong> <span dangerouslySetInnerHTML={{ __html: mdToHtml(subredditInfo.shortDescription) }} />
            </li>
          </ul>

          <div className="external-links">
            <h4>External Links</h4>

            <ul>
              <li>
                <ExternalLink to={subredditInfo.name} type="subreddit">
                  subreddit
                </ExternalLink>
              </li>
              <li>
                <ExternalLink to={`https://reddit.com/r/${subredditInfo.name}/about/traffic`}>
                  traffic
                </ExternalLink>
              </li>
              <li>
                <ExternalLink to={`http://redditmetrics.com/r/${subredditInfo.name}`}>
                  reddit metrics
                </ExternalLink>
              </li>
              <li>
                <ExternalLink to={`https://snoopsnoo.com/r/${subredditInfo.name}`}>
                  snoopsnoo
                </ExternalLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
