import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Container } from 'react-bootstrap';
import Sticky from 'react-stickynode';
import Filters from '../../../components/Filters';
import SubredditInfo from '../../../components/SubredditInfo';
import { omit } from '../../../utils';
import styles from './logs.module.scss';

interface Props {
  isLoading: boolean;
  children: ReactNode;
  before?: string | null;
  after?: string | null;
  isAuthenticatedMod: boolean;
}

export default function LogLayout({
  isLoading,
  before,
  after,
  children,
  isAuthenticatedMod,
}: Props) {
  const router = useRouter();
  const isPermalink = !!router.query.logId;
  const isFiltered = !!(
    router.query.link ||
    router.query.mod ||
    router.query.author ||
    router.query.type ||
    router.query.actions
  );

  const loadOlder = () =>
    router.push({
      query: {
        ...omit(router.query, ['before']),
        after,
      },
    });

  const loadNewer = () =>
    router.push({
      query: {
        ...omit(router.query, ['after']),
        before,
      },
    });

  const loadNewest = () => {
    router.push({
      query: omit(router.query, ['after', 'before']),
    });
  };

  return (
    <Container fluid className={styles.logs}>
      <div className={styles['log-item-container']}>
        {isLoading && <div className={styles['logs-fetching-overlay']} />}

        {children}

        {(isFiltered || isPermalink) && (
          <div className={styles['view-all']}>
            <Link href={`/r/${router.query.subreddit}`}>
              <a>view all logs for {router.query.subreddit}</a>
            </Link>
          </div>
        )}
      </div>

      <div className={styles['filter-container']}>
        <Sticky>
          <div className={styles.sticky}>
            <Filters
              disableFilters={isPermalink || isLoading}
              isAuthenticatedMod={isAuthenticatedMod}
            />

            <div className={styles['log-navigation']}>
              <Button
                variant="light"
                className={styles.newest}
                disabled={
                  (!router.query.before && !router.query.after) || isPermalink
                }
                onClick={loadNewest}
              >
                Newest
              </Button>
              <Button
                variant="light"
                className={styles.newer}
                disabled={!before || isPermalink}
                onClick={loadNewer}
              >
                &lt; Newer
              </Button>
              <Button
                variant="light"
                className={styles.older}
                disabled={!after || isPermalink}
                onClick={loadOlder}
              >
                Older &gt;
              </Button>
            </div>

            <SubredditInfo />
          </div>
        </Sticky>
      </div>
    </Container>
  );
}
