import * as React from 'react';
import ExternalLink from './ExternalLink';
import './home.scss';

export default function Home() {
  return (
    <section className="home">
      <p>Mod Logs allows subreddits to opt in to providing transparency to their moderation.</p>
      <p>Get started by selecting a subreddit from the dropdown above.</p>
      <p>
        If you're a moderator and want to use Mod Logs in your subreddit, check out the <ExternalLink to="https://github.com/vitosamson/modlogs/tree/master/ModeratorInstructions.md">Moderator Help</ExternalLink>.
      </p>
    </section>
  );
}
