import React from 'react';
import styles from './home.module.scss';
import Link from 'next/link';

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
        out the <Link href="/mods">Moderator Instructions</Link>.
      </p>
    </section>
  );
}
