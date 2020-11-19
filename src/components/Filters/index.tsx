import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { Card, DropdownButton, Dropdown } from 'react-bootstrap';
import { defaultLimit } from '../../config';
import { LogsQuery } from '../../pages/api/logs/[subreddit]';
import { modActionTypes } from '../../utils';
import Action from './Action';
import FilterField from './FilterField';
import styles from './filters.module.scss';

interface Props {
  disableFilters?: boolean;
  isAuthenticatedMod: boolean;
}

const limits = [10, 25, 50, 100];

const splitActions = (actions: string): string[] => {
  return actions.length ? actions.split(',').map(a => a.toLowerCase()) : [];
};

export default function Filters(props: Props) {
  const router = useRouter();

  const actionsQuery = (router.query.actions as string) || '';
  const [showActions, setShowActions] = useState(!!actionsQuery.length);

  // These are kept as local state only so the user can edit them.
  // Once the user "submits" a filter, its actual state is stored in the route
  const [linkFilter, setLinkFilter] = useState(String(router.query.link || ''));
  const [authorFilter, setAuthorFilter] = useState(String(router.query.author));
  const [modFilter, setModFilter] = useState(String(router.query.mod));

  // Update local state when the route changes
  useEffect(() => setLinkFilter(String(router.query.link || '')), [
    router.query.link,
  ]);
  useEffect(() => setAuthorFilter(String(router.query.author || '')), [
    router.query.author,
  ]);
  useEffect(() => setModFilter(String(router.query.mod || '')), [
    router.query.mod,
  ]);

  const updateFilter = useCallback(
    (filters: Partial<LogsQuery>) => {
      const query = { ...router.query };

      Object.entries(filters).forEach(([key, val]) => {
        if (val === undefined) {
          delete query[key];
        } else {
          query[key] = String(val);
        }
      });

      router.push({ query });
    },
    [router.query]
  );

  const handleLimitChange = useCallback(
    (limit: string | null) => {
      updateFilter({ limit: limit || undefined });
    },
    [updateFilter]
  );

  const handleTypeChange = useCallback(
    (type: string | null) => {
      updateFilter({ type: type as LogsQuery['type'] });
    },
    [updateFilter]
  );

  const handleClearFilters = () => {
    updateFilter({
      actions: undefined,
      after: undefined,
      before: undefined,
      mod: undefined,
      link: undefined,
      author: undefined,
      type: undefined,
    });
  };

  const currentActions = splitActions(actionsQuery);
  const handleActionsChange = useCallback(
    (action: string) => {
      const selectedActions = splitActions(actionsQuery);

      if (action === 'all' && selectedActions.length > 0) {
        updateFilter({
          actions: undefined,
        });
      } else {
        const nextActions = selectedActions.includes(action)
          ? selectedActions.filter(a => a !== action)
          : selectedActions.concat(action);

        updateFilter({
          actions: nextActions.join(','),
        });
      }
    },
    [actionsQuery]
  );

  const canClearFilters = !!(
    router.query.link ||
    router.query.author ||
    router.query.mod ||
    router.query.type ||
    actionsQuery
  );

  let displayType;
  switch (router.query.type) {
    case 'submissions':
      displayType = 'Submissions';
      break;
    case 'comments':
      displayType = 'Comments';
      break;
    default:
      displayType = 'Submissions & Comments';
  }

  return (
    <Card>
      <Card.Header>
        <h5>Filter</h5>
        {canClearFilters && (
          <a
            href="#"
            role="button"
            onClick={evt => {
              evt.preventDefault();
              handleClearFilters();
            }}
          >
            clear filters
          </a>
        )}
      </Card.Header>

      <Card.Body>
        <div className={styles['limit-type-container']}>
          <DropdownButton
            variant="default"
            title={`Limit: ${router.query.limit || defaultLimit}`}
            id="limit"
            onSelect={handleLimitChange}
            disabled={props.disableFilters}
            className={styles['limit-selector']}
          >
            {limits.map(l => (
              <Dropdown.Item eventKey={String(l)} key={l}>
                {l}
              </Dropdown.Item>
            ))}
          </DropdownButton>

          <DropdownButton
            variant="default"
            title={`View: ${displayType}`}
            id="type"
            onSelect={handleTypeChange}
            disabled={props.disableFilters}
            className={styles['type-selector']}
          >
            <Dropdown.Item eventKey={undefined}>
              Submissions & Comments
            </Dropdown.Item>
            <Dropdown.Item eventKey="submissions">Submissions</Dropdown.Item>
            <Dropdown.Item eventKey="comments">Comments</Dropdown.Item>
          </DropdownButton>
        </div>

        <FilterField
          label="Link"
          disabled={props.disableFilters}
          localValue={linkFilter}
          actualValue={String(router.query.link || '')}
          placeholder="filter by post or comment link"
          onChange={setLinkFilter}
          onClear={() => updateFilter({ link: undefined })}
          onSubmit={evt => {
            evt.preventDefault();
            updateFilter({ link: linkFilter });
          }}
        />

        {props.isAuthenticatedMod && (
          <>
            <FilterField
              label="author"
              disabled={props.disableFilters}
              localValue={authorFilter}
              actualValue={String(router.query.author || '')}
              placeholder="filter by author"
              onChange={setAuthorFilter}
              onClear={() => updateFilter({ author: undefined })}
              onSubmit={evt => {
                evt.preventDefault();
                updateFilter({ author: authorFilter });
              }}
            />

            <FilterField
              label="moderator"
              disabled={props.disableFilters}
              localValue={modFilter}
              actualValue={String(router.query.mod || '')}
              placeholder="filter by moderator"
              onChange={setModFilter}
              onClear={() => updateFilter({ mod: undefined })}
              onSubmit={evt => {
                evt.preventDefault();
                updateFilter({ mod: modFilter });
              }}
            />
          </>
        )}

        <a
          href="#"
          role="button"
          className={styles['toggle-actions']}
          onClick={evt => {
            evt.preventDefault();
            setShowActions(!showActions);
          }}
        >
          Filter by action type
          <i
            className={`fa ${showActions ? 'fa-caret-down' : 'fa-caret-right'}`}
          />
        </a>

        {!!currentActions.length && (
          <a
            href="#"
            role="button"
            onClick={evt => {
              evt.preventDefault();
              handleActionsChange('all');
            }}
            style={{ marginLeft: 10 }}
          >
            show all
          </a>
        )}

        {showActions && (
          <div>
            {modActionTypes.map(type => (
              <Action
                key={type.value}
                type={type}
                onSelect={handleActionsChange}
                selected={currentActions.includes(type.value)}
                disabled={props.disableFilters}
              />
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
