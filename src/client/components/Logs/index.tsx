import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import LogItem, { LogItemProps } from './LogItem';
import { ILog } from '../../../server/models/log/type';

interface Props extends LogItemProps {
  logs: ILog[];
  fetching: boolean;
  onChangeFilter: (filter: string) => void;
}

type LogsProps = Props & RouteComponentProps<any, any>;

class Logs extends React.PureComponent<LogsProps, null> {
  public render() {
    const { logs, fetching, onChangeFilter } = this.props;

    if (!fetching && !logs.length) {
      return <h4 className="text-center">No logs were found :(</h4>;
    }

    return (
      <div>
        { logs.map(log => {
          return <LogItem onChangeFilter={onChangeFilter} log={log} key={log._id} />;
        })}
      </div>
    );
  }
}

export default connect(state => ({
  logs: state.logs.logs,
  fetching: state.logs.fetching,
}))(Logs);
