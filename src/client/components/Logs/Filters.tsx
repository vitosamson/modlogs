import * as React from 'react';
import { Button, DropdownButton, MenuItem, FormControl, InputGroup, FormGroup } from 'react-bootstrap';
import modActionTypes from '../../utils/modActionTypes';
import './filters.scss';

interface Props {
  limit: string;
  currentLinkFilter: string;
  currentAuthorFilter: string;
  currentModFilter: string;
  currentActions: string;
  currentType?: string;
  onChangeLimit: (limit: string) => void;
  onChangeLinkFilter: (filter: string) => void;
  onChangeAuthorFilter: (filter: string) => void;
  onChangeModFilter: (filter: string) => void;
  onChangeActions: (actions: string[]) => void;
  onChangeType: (type: string | null) => void;
  onClearFilters: () => void;
  disableFilters?: boolean;
  isAuthenticatedMod: boolean;
}

interface State {
  linkFilter: string;
  authorFilter: string;
  modFilter: string;
  actionsSectionOpen: boolean;
}

const limits = [10, 25, 50, 100];

const splitActions = (actions: string): string[] => {
  return actions.length ? actions.split(',').map(a => a.toLowerCase()) : [];
};

export default class LogFilters extends React.PureComponent<Props, State> {
  public state = {
    linkFilter: this.props.currentLinkFilter || '',
    authorFilter: this.props.currentAuthorFilter || '',
    modFilter: this.props.currentModFilter || '',
    actionsSectionOpen: !!this.props.currentActions,
  };

  public componentWillReceiveProps(nextProps: Props) {
    const nextState: Partial<State> = {};

    if (
      nextProps.currentLinkFilter !== this.props.currentLinkFilter &&
      nextProps.currentLinkFilter !== this.state.linkFilter
    ) {
      nextState.linkFilter = nextProps.currentLinkFilter;
    }

    if (
      nextProps.currentAuthorFilter !== this.props.currentAuthorFilter &&
      nextProps.currentAuthorFilter !== this.state.authorFilter
    ) {
      nextState.authorFilter = nextProps.currentAuthorFilter;
    }

    if (
      nextProps.currentModFilter !== this.props.currentModFilter &&
      nextProps.currentModFilter !== this.state.modFilter
    ) {
      nextState.modFilter = nextProps.currentModFilter;
    }

    if (Object.keys(nextState).length) {
      this.setState(() => nextState);
    }
  }

  private handleLimitChange = (limit: any) => {
    this.props.onChangeLimit(limit);
  }

  private handleLinkFilterChange = (evt: React.ChangeEvent<any>) => {
    this.setState({ linkFilter: evt.target.value });
  }

  private submitLinkFilterChange = (evt?: React.FormEvent<any>) => {
    if (evt) evt.preventDefault();
    this.props.onChangeLinkFilter(this.state.linkFilter);
  }

  private clearLinkFilter = () => {
    this.setState({ linkFilter: '' }, this.submitLinkFilterChange);
  }

  private handleAuthorFilterChange = (evt: React.ChangeEvent<any>) => {
    this.setState({ authorFilter: evt.target.value });
  }

  private submitAuthorFilterChange = (evt?: React.FormEvent<any>) => {
    if (evt) evt.preventDefault();
    this.props.onChangeAuthorFilter(this.state.authorFilter);
  }

  private clearAuthorFilter = () => {
    this.setState({ authorFilter: '' }, this.submitAuthorFilterChange);
  }

  private handleModFilterChange = (evt: React.ChangeEvent<any>) => {
    this.setState({ modFilter: evt.target.value });
  }

  private submidModFilterChange = (evt?: React.ChangeEvent<any>) => {
    if (evt) evt.preventDefault();
    this.props.onChangeModFilter(this.state.modFilter);
  }

  private clearModFilter = () => {
    this.setState({ modFilter: '' }, this.submidModFilterChange);
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
        currentActions.concat(action)
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
    const {
      limit,
      currentLinkFilter,
      currentAuthorFilter,
      currentModFilter,
      onClearFilters,
      currentType,
      disableFilters,
      isAuthenticatedMod,
    } = this.props;

    const { linkFilter, authorFilter, modFilter, actionsSectionOpen } = this.state;
    const currentActions = splitActions(this.props.currentActions);
    const canClearFilters = currentLinkFilter || currentAuthorFilter || currentModFilter || currentActions.length > 0;

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

          { canClearFilters &&
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
              { limits.map(l => (
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

          <FilterField
            localValue={linkFilter}
            actualValue={currentLinkFilter}
            onChange={this.handleLinkFilterChange}
            onSubmit={this.submitLinkFilterChange}
            disabled={disableFilters}
            label="link"
            onClear={this.clearLinkFilter}
            placeholder="filter by post or comment link"
          />

          { isAuthenticatedMod &&
            <div>
              <FilterField
                localValue={authorFilter}
                actualValue={currentAuthorFilter}
                onChange={this.handleAuthorFilterChange}
                onSubmit={this.submitAuthorFilterChange}
                disabled={disableFilters}
                label="author"
                onClear={this.clearAuthorFilter}
                placeholder="filter by author"
              />

              <FilterField
                localValue={modFilter}
                actualValue={currentModFilter}
                onChange={this.handleModFilterChange}
                onSubmit={this.submidModFilterChange}
                disabled={disableFilters}
                label="moderator"
                placeholder="filter by moderator"
                onClear={this.clearModFilter}
              />
            </div>
          }

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
      { type.label }
    </label>
  );
};

interface FilterFieldProps {
  onSubmit: (evt: React.SyntheticEvent<any>) => void;
  disabled: boolean;
  localValue?: string; // the value stored in local state while editing
  actualValue?: string; // the value from the route query param
  onChange: (evt: React.ChangeEvent<any>) => void;
  placeholder: string;
  label: string;
  onClear: () => void;
}

class FilterField extends React.PureComponent<FilterFieldProps, null> {
  private clearFilter = () => {
    const { disabled, onClear } = this.props;
    if (!disabled) onClear();
  }

  public render() {
    const { onSubmit, disabled, actualValue, localValue, label, placeholder, onChange } = this.props;

    return (
      <form onSubmit={onSubmit} className="filter-field">
        <fieldset disabled={disabled}>
          <FormGroup>
            <InputGroup>
              { actualValue &&
                <InputGroup.Addon>
                  { label }
                  <span onClick={this.clearFilter} className="clear-filter"> &times;</span>
                </InputGroup.Addon>
              }
              <FormControl
                placeholder={placeholder}
                type="text"
                onChange={onChange}
                value={localValue}
              />
              <InputGroup.Button>
                <Button type="submit">
                  <i className="fa fa-search" />
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </fieldset>
      </form>
    );
  }
}
