import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import LogItem, { LogItemProps } from './LogItem';
import { ILog } from '../../../server/models/log/type';

export interface LogsProps extends LogItemProps {
  logs: ILog[];
  fetching: boolean;
  onChangeLinkFilter: (filter: string) => void;
  onChangeAuthorFilter: (filter: string) => void;
  isAuthenticatedMod: boolean;
}

type Props = LogsProps & RouteComponentProps<any, any>;

class Logs extends React.PureComponent<Props, null> {
  public componentWillReceiveProps(nextProps: LogsProps) {
    // scroll to the top of the logs container when we receive new logs
    if (nextProps.logs !== this.props.logs) {
      const node = findDOMNode(this);
      const { top } = node.getBoundingClientRect();
      if (top < 0) node.scrollIntoView();
    }
  }

  public render() {
    const { logs, fetching, onChangeLinkFilter, onChangeAuthorFilter, isAuthenticatedMod } = this.props;

    if (!fetching && !logs.length) {
      return <h4 className="text-center">No logs were found :(</h4>;
    }

    return (
      <div>
        { logs.map(log => {
          return (
            <LogItem
              onChangeLinkFilter={onChangeLinkFilter}
              onChangeAuthorFilter={onChangeAuthorFilter}
              isAuthenticatedMod={isAuthenticatedMod}
              log={log}
              key={log._id}
            />
          );
        })}
      </div>
    );
  }
}

export default connect(state => ({
  logs: state.logs.logs,
  fetching: state.logs.fetching,
  isAuthenticatedMod: state.app.isAuthenticatedMod,
}))(Logs);
