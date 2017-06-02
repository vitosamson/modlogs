import * as React from 'react';
import { Link } from 'react-router';
import { Dropdown, MenuItem } from 'react-bootstrap';
import ExternalLink from '../ExternalLink';
import { ILog } from '../../../server/models/log/type';
import mdToHtml from '../../utils/mdToHtml';
import './logItem.scss';

export interface LogItemProps {
  log: ILog;
  onChangeFilter: (filter: string) => void;
}

interface State {
  logCreated: string;
}

export default class LogItem extends React.PureComponent<LogItemProps, State> {
  public state: State = {
    logCreated: '',
  };

  public componentDidMount() {
    this.updateCreatedString(this.props.log);
  }

  public componentWillReceiveProps(nextProps: LogItemProps) {
    if (nextProps.log !== this.props.log) {
      this.updateCreatedString(nextProps.log);
    }
  }

  /**
   * the server and client may have different timezones, which causes the formatted date to change between
   * the server-side render and the client render, leading react to do a full re-render because the checksum
   * no longer matches.
   * by setting this only when the component actually mounts (on the client), we can avoid that.
   */
  private updateCreatedString(log: ILog) {
    const created = new Date(log.timestamp);
    this.setState({
      logCreated: `${created.toLocaleDateString()} @ ${created.toLocaleTimeString()}`,
    });
  }

  public render() {
    const { log, onChangeFilter } = this.props;
    const { logCreated } = this.state;

    return (
      <div className="panel panel-default log-item">
        <div className="panel-heading">
          <div className="action">
            <i className="fa fa-legal" />
            { log.action }
          </div>

          { log.mod &&
            <div className="mod">
              <i className="fa fa-user" />
              { log.mod }
            </div>
          }

          <div className="time">
            { logCreated }
          </div>
        </div>

        <LogContents log={log} />

        <div className="panel-footer">
          <div className="permalinks">
            { log.link &&
              <ExternalLink to={log.link} type="submission">reddit permalink</ExternalLink>
            }

            <Link to={`/r/${log.subreddit}/log/${log.redditId}`}>log permalink</Link>
          </div>

          <FilterLogDropdown log={log} onChangeFilter={onChangeFilter} />

          <div className="clearfix" />
        </div>
      </div>
    );
  }
}

const noContent = '[contents unavailable]';

class LogContents extends React.PureComponent<{ log: ILog }, null> {
  public render() {
    const { log } = this.props;
    let content;
    let title;
    let author;

    switch (log.action) {
      case 'approvecomment':
      case 'removecomment':
      case 'distinguish':
      case 'sticky':
        content = <blockquote dangerouslySetInnerHTML={{ __html: mdToHtml(log.content || noContent) }} />;
        author = log.author;
        break;
      case 'approvelink':
      case 'removelink':
        content = <blockquote dangerouslySetInnerHTML={{ __html: mdToHtml(log.content || noContent) }} />;
        author = log.author;
        title = log.title;
        break;
      case 'wikirevise':
        content = <span>{ log.details }</span>;
        break;
      default:
        content = <span>No additional details available</span>;
    }

    return (
      <div className="panel-body contents">
        { title && <h5 className="title">{ title }</h5> }
        { content }
        { author &&
          <div className="author">
            - <ExternalLink to={log.author} type="user">/u/{ log.author }</ExternalLink>
          </div>
        }

        { process.env.NODE_ENV === 'development' &&
          <div className="reddit-id">{ log.redditId }<br/>{ log._id.toString() }</div>
        }
      </div>
    );
  }
}

const extractLink = (log: ILog, type: 'comment' | 'submission') => {
  const link = log.link.endsWith('/') ? log.link.substr(0, log.link.length - 1) : log.link;
  if (type === 'submission' && !log.isSubmission) return link.substr(0, link.lastIndexOf('/'));
  return link;
};

const FilterLogDropdownToggle = ({ bsRole, bsClass, ...props }: any) => (
  <span {...props} className="filter-toggle">filter <span className="caret" /></span>
);

class FilterLogDropdown extends React.PureComponent<LogItemProps, null> {
  public render() {
    const { log, onChangeFilter } = this.props;
    if (!log.link) return null;
    return (
      <Dropdown id="filter-by" className="filter-by" pullRight={true}>
        <FilterLogDropdownToggle bsRole="toggle" />
        <Dropdown.Menu>
          { log.isComment &&
            <MenuItem onClick={() => onChangeFilter(extractLink(log, 'comment'))}>all logs for this comment</MenuItem>
          }
          <MenuItem onClick={() => onChangeFilter(extractLink(log, 'submission'))}>all logs for this submission</MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
