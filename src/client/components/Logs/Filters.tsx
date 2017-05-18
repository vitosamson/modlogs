import * as React from 'react';
import { Button, DropdownButton, MenuItem, FormControl, InputGroup, FormGroup } from 'react-bootstrap';
import modActionTypes from '../../utils/modActionTypes';
import './filters.scss';

interface Props {
  limit: string;
  currentFilter: string;
  currentActions: string;
  currentType?: string;
  onChangeLimit: (limit: string) => void;
  onChangeFilter: (filter: string) => void;
  onChangeActions: (actions: string[]) => void;
  onChangeType: (type: string | null) => void;
  onClearFilters: () => void;
  disableFilters?: boolean;
}

interface State {
  filter: string;
  actionsSectionOpen: boolean;
}

const limits = [10, 25, 50, 100];

const splitActions = (actions: string): string[] => {
  return actions.length ? actions.split(',').map(a => a.toLowerCase()) : [];
};

export default class LogFilters extends React.PureComponent<Props, State> {
  public state = {
    filter: this.props.currentFilter || '',
    actionsSectionOpen: false,
  };

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.currentFilter !== this.state.filter) {
      this.setState({ filter: nextProps.currentFilter });
    }
  }

  private handleLimitChange = (limit: any) => {
    this.props.onChangeLimit(limit);
  }

  private handleFilterChange = (evt: React.ChangeEvent<any>) => {
    this.setState({ filter: evt.target.value });
  }

  private submitFilterChange = (evt?: React.FormEvent<any>) => {
    if (evt) evt.preventDefault();
    this.props.onChangeFilter(this.state.filter);
  }

  private handleActionSelect = (action: string) => {
    const { onChangeActions } = this.props;
    const currentActions = splitActions(this.props.currentActions);

    if (action === 'all' && currentActions.length > 0) {
      return onChangeActions([]);
    }

    onChangeActions(
      currentActions.includes(action) ?
        currentActions.filter(a => a !== action) :
        currentActions.concat(action),
    );
  }

  private handleTypeChange = (type: any) => {
    this.props.onChangeType(type);
  }

  private toggleActionsSection = () => {
    this.setState(state => ({
      actionsSectionOpen: !state.actionsSectionOpen,
    }));
  }

  public render() {
    const { limit, currentFilter, onClearFilters, currentType, disableFilters } = this.props;
    const { filter, actionsSectionOpen } = this.state;
    const currentActions = splitActions(this.props.currentActions);

    let displayType;
    switch (currentType) {
      case 'submissions': displayType = 'Submissions'; break;
      case 'comments': displayType = 'Comments'; break;
      default: displayType = 'Submissions & Comments';
    }

    return (
      <div className="panel panel-default log-filters">
        <div className="panel-heading">
          <h3 className="panel-title">Filters</h3>

          { (currentFilter || currentActions.length > 0) &&
            <div className="clear-filters" onClick={onClearFilters}>
              clear filters
            </div>
          }

          <div className="clearfix" />
        </div>
        <div className="panel-body">
          <div className="limit-selector">
            <DropdownButton
              bsStyle="default"
              title={`Limit: ${limit}`}
              id="limit"
              onSelect={this.handleLimitChange}
              disabled={disableFilters}
            >
              {limits.map(l => (
                <MenuItem eventKey={l} key={l}>{l}</MenuItem>
              ))}
            </DropdownButton>
          </div>

          <div className="type-selector">
            <DropdownButton
              bsStyle="default"
              title={`View: ${displayType}`}
              id="type"
              onSelect={this.handleTypeChange}
              disabled={disableFilters}
            >
              <MenuItem eventKey={null}>Submissions & Comments</MenuItem>
              <MenuItem eventKey="submissions">Submissions</MenuItem>
              <MenuItem eventKey="comments">Comments</MenuItem>
            </DropdownButton>
          </div>

          <form onSubmit={this.submitFilterChange}>
            <FormGroup>
              <InputGroup>
                <FormControl
                  placeholder="filter by post or comment link"
                  type="text"
                  onChange={this.handleFilterChange}
                  value={filter}
                  disabled={disableFilters}
                />
                <InputGroup.Button>
                  <Button type="submit">
                    <i className="fa fa-search" />
                  </Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
          </form>

          <h5 onClick={this.toggleActionsSection} className={`toggle-actions ${actionsSectionOpen ? 'is-open' : ''}`}>
            Filter by action type
            <i className={`fa ${actionsSectionOpen ? 'fa-caret-down' : 'fa-caret-right'}`} />
          </h5>

          { actionsSectionOpen &&
            <div>
              <ActionType
                type={{ label: 'show all', value: 'all'}}
                onSelect={this.handleActionSelect}
                selected={!currentActions.length}
                className="show-all"
                disabled={disableFilters}
              />
              { modActionTypes.map(type => (
                <ActionType
                  key={type.value}
                  type={type}
                  onSelect={this.handleActionSelect}
                  selected={currentActions.includes(type.value)}
                  disabled={disableFilters}
                />
              ))}
            </div>
          }
        </div>
      </div>
    );
  }
}

interface ActionTypeProps {
  type: { label: string; value: string; };
  selected: boolean;
  onSelect: (type: string) => void;
  className?: string;
  disabled?: boolean;
}

const ActionType = ({ type, selected, onSelect, className, disabled }: ActionTypeProps) => {
  return (
    <label className={`action-type ${className || ''}`}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(type.value)}
        style={{ marginRight: 5 }}
        disabled={disabled}
      />
      {type.label}
    </label>
  );
};
