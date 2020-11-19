import Link from 'next/link';
import React from 'react';
import { Card } from 'react-bootstrap';
import { ILog } from '../../models/log';
import { ExternalLink } from '../ExternalLink';
import LogContents from './Contents';
import FilterDropdown from './FilterDropdown';
import styles from './log.module.scss';

interface Props {
  log: ILog;
  isAuthenticatedMod: boolean;
}

export default function LogItem({ log, isAuthenticatedMod }: Props) {
  const modIconClassname =
    log.mod === 'AutoModerator' || log.mod === 'reddit'
      ? 'fa fa-robot'
      : 'fa fa-user';

  return (
    <Card className={styles['log-item']}>
      <Card.Header className={styles.header}>
        <div className={styles.action}>
          <i className="fa fa-gavel" /> {log.action}
        </div>

        {log.mod && (
          <div className={styles.mod}>
            <i className={modIconClassname} /> {log.mod}
          </div>
        )}

        <div className={styles.time}>
          {new Date(log.timestamp).toLocaleDateString()} @{' '}
          {new Date(log.timestamp).toLocaleTimeString()}
        </div>
      </Card.Header>

      <LogContents log={log} />

      {log.automodActionReason && (
        <div className={`panel-body ${styles['automod-action']}`}>
          AutoModerator action:
          <span className={styles.reason}>{log.automodActionReason}</span>
        </div>
      )}

      <Card.Footer>
        <div className={styles.permalinks}>
          {log.link && (
            <ExternalLink to={log.link} type="submission">
              reddit permalink
            </ExternalLink>
          )}

          <Link href={`/r/${log.subreddit}/log/${log.redditId}`}>
            log permalink
          </Link>
        </div>

        <FilterDropdown log={log} isAuthenticatedMod={isAuthenticatedMod} />

        <div className="clearfix" />
      </Card.Footer>
    </Card>
  );
}
