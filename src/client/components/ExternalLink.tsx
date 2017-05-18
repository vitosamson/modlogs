import * as React from 'react';

interface ExternalLinkProps {
  to: string;
  type?: 'user' | 'subreddit' | 'submission';
  children?: any;
}

const ExternalLink = ({ to, type, children }: ExternalLinkProps) => {
  let href;

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

  return <a href={href} target="_blank" rel="noopener noreferrer">{ children }</a>;
};

export default ExternalLink;
