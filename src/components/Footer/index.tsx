import Link from 'next/link';
import React from 'react';
import { ExternalLink } from '../ExternalLink';
import styles from './footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <ExternalLink to="modlogs" type="user">
        /u/modlogs
      </ExternalLink>
      |
      <ExternalLink to="https://github.com/vitosamson/modlogs">
        source on github
      </ExternalLink>
      |<Link href="/mods">moderator instructions</Link>
    </footer>
  );
}
