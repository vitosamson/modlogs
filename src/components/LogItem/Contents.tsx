import React, { ReactNode, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { ILog } from '../../models/log';
import { mdToHtml } from '../../utils/markdown';
import { ExternalLink } from '../ExternalLink';
import styles from './log.module.scss';

interface Props {
  log: ILog;
}

const noContent = '[contents unavailable]';

export default function LogContents({ log }: Props) {
  const { body, title, author } = useMemo(() => {
    let body: ReactNode;
    let title: ReactNode;
    let author: ReactNode;

    switch (log.action) {
      case 'approvecomment':
      case 'removecomment':
      case 'distinguish':
      case 'sticky':
        body = (
          <blockquote
            className={styles.quote}
            dangerouslySetInnerHTML={{
              __html: mdToHtml(log.content || noContent),
            }}
          />
        );
        author = log.author;
        break;
      case 'approvelink':
      case 'removelink':
        body = (
          <blockquote
            className={styles.quote}
            dangerouslySetInnerHTML={{
              __html: mdToHtml(log.content || noContent),
            }}
          />
        );
        author = log.author;
        title = log.title;
        break;
      case 'wikirevise':
        body = <span>{log.details}</span>;
        break;
      case 'banuser':
      case 'unbanuser':
        if (!log.bannedUser && !log.banDuration && !log.banDescription) {
          body = noContent;
        } else {
          body = (
            <>
              {log.bannedUser && (
                <div>
                  <strong>User: </strong>
                  {log.bannedUser}
                </div>
              )}
              {log.banDuration && (
                <div>
                  <strong>Duration: </strong>
                  {log.banDuration}
                </div>
              )}
              {log.banDescription && (
                <div>
                  <strong>Description: </strong>
                  {log.banDescription}
                </div>
              )}
            </>
          );
        }
        break;
      case 'muteuser':
      case 'unmuteuser':
        body = log.mutedUser ? (
          <>
            <strong>User: </strong>
            {log.mutedUser}
          </>
        ) : (
          noContent
        );
        break;
      default:
        body = <span>No additional details available</span>;
    }

    return { body, title, author };
  }, [log]);

  return (
    <Card.Body>
      {title && <h5 className={styles.title}>{title}</h5>}

      {body}

      {author && (
        <div className={styles.author}>
          -{' '}
          <ExternalLink to={log.author!} type="user">
            /u/{log.author}
          </ExternalLink>
        </div>
      )}
    </Card.Body>
  );
}
