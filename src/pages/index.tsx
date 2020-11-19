import React from 'react';
import styles from './home.module.scss';
import { ExternalLink } from '../components/ExternalLink';

export default function Home() {
  return (
    <section className={styles.home}>
      <p>
        Mod Logs allows subreddits to opt in to providing transparency to their
        moderation.
      </p>
      <p>Get started by selecting a subreddit from the dropdown above.</p>
      <p>
        If you're a moderator and want to use Mod Logs in your subreddit, check
        out the{' '}
        <ExternalLink to="https://github.com/vitosamson/modlogs/tree/master/ModeratorInstructions.md">
          Moderator Help
        </ExternalLink>
        .
      </p>
    </section>
  );
}
