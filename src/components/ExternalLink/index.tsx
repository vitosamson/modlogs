import React, { FC } from 'react';

interface Props {
  to: string;
  type?: 'user' | 'subreddit' | 'submission';
}

export const ExternalLink: FC<Props> = ({ to, type, children }) => {
  let href: string;

  switch (type) {
    case 'user':
      href = `https://www.reddit.com/user/${to}`;
      break;
    case 'subreddit':
      href = `https://www.reddit.com/r/${to}`;
      break;
    case 'submission':
      href = `https://www.reddit.com/${to}`;
      break;
    default:
      href = to;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};
