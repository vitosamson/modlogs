import React from 'react';
import styles from './404.module.scss';

/**
 * We need to override the default next.js 404 page since next attempts to generate a static page for it,
 * which causes the fetch requests in _app.getInitialProps to fail during the build process.
 */
export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div>
        <h1 className={styles.code}>404</h1>
        <div className={styles.textWrapper}>
          <h2 className={styles.text}>This page could not be found.</h2>
        </div>
      </div>
    </div>
  );
}
