import React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { Card } from 'react-bootstrap';
import { mdToHtml } from '../../utils/markdown';
import { ExternalLink } from '../ExternalLink';
import { ISubreddit } from '../../models/subreddit';
import styles from './subredditInfo.module.scss';

export default function SubredditInfo() {
  const router = useRouter();
  const subredditName = String(router.query.subreddit);
  const { data: subreddit } = useSWR<ISubreddit | null>(
    `/api/subreddits/${subredditName}`
  );

  return (
    <Card className={styles['subreddit-info']}>
      <Card.Header>
        <h5>Subreddit Info</h5>
      </Card.Header>
      <Card.Body>
        {subreddit && (
          <ul>
            <li>
              <strong>Name: </strong> {subreddit.name}
            </li>
            <li>
              <strong>Subscribers: </strong> {subreddit.subscribers}
            </li>
            <li>
              <strong>Created: </strong>{' '}
              {new Date(subreddit.created).toLocaleDateString()}
            </li>
            {subreddit.shortDescription && (
              <li>
                <strong>Description: </strong>{' '}
                <span
                  dangerouslySetInnerHTML={{
                    __html: mdToHtml(subreddit.shortDescription),
                  }}
                />
              </li>
            )}
          </ul>
        )}

        <div className={styles['external-links']}>
          <ul>
            <li>
              <ExternalLink to={subredditName} type="subreddit">
                subreddit
              </ExternalLink>
            </li>
            <li>
              <ExternalLink to={`http://redditmetrics.com/r/${subredditName}`}>
                reddit metrics
              </ExternalLink>
            </li>
            <li>
              <ExternalLink to={`https://snoopsnoo.com/r/${subredditName}`}>
                snoopsnoo
              </ExternalLink>
            </li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
}
