import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Select, { components } from 'react-select';
import type { ISubreddit } from '../../models/subreddit';
import { host } from '../../config';
import headerStyles from './header.module.scss';

const selectComponents: Partial<typeof components> = {
  // Render the currently selected subreddit as /r/{subreddit}
  SingleValue: ({ children, ...props }) => (
    <components.SingleValue {...props}>
      {children ? `/r/${children}` : props.selectProps.placeholder}
    </components.SingleValue>
  ),
};

interface Props {
  username: string | null;
  subreddits: ISubreddit[];
}

export default function Header({ username, subreddits }: Props) {
  const router = useRouter();
  const currentSubreddit = String(router.query.subreddit || '');
  const subredditOptions = useMemo(
    () =>
      subreddits
        ?.sort((a, b) => a.nameLowercase.localeCompare(b.nameLowercase))
        .map(sub => ({
          label: sub.name,
          value: sub.nameLowercase,
        })) || [],
    [subreddits]
  );
  const currentSubredditOption = useMemo(() => {
    const option = subredditOptions.find(
      sub => sub.value === currentSubreddit.toLowerCase()
    );

    return (
      option || {
        label: '',
        value: '',
      }
    );
  }, [subredditOptions, currentSubreddit]);

  /**
   * There seems to be a bug where, when updating the route query like
   * `router.push({ query: { subreddit: 'foo', link: 'bar' } })`,
   * `router.asPath` changes to something like `/r/[subreddit]?link=foo&subreddit=bar`, instead of
   * `/r/foo?link=bar`.
   * This works around that by relying on `router.asPath` only for the server-side render, and
   * `window.location.pathname` and `window.location.search` thereafter.
   * https://github.com/vercel/next.js/issues/17840
   */
  const currentPath =
    typeof window === 'undefined'
      ? router.asPath
      : `${window.location.pathname}${window.location.search}`;
  const authRedirectUrl = encodeURIComponent(`https://${host}${currentPath}`);

  return (
    <header className={headerStyles.header}>
      <h1 className={headerStyles.name}>
        <Link href="/">Mod Logs</Link>
      </h1>

      <div className={headerStyles['subreddit-selector']}>
        <Select
          instanceId="subreddit-selector"
          inputId="subreddit-selector-input"
          options={subredditOptions}
          value={currentSubredditOption}
          placeholder="Select a subreddit"
          components={selectComponents}
          isClearable={false}
          onChange={opt => router.push(`/r/${opt.value}`)}
        />
      </div>

      <ul className={headerStyles.links}>
        <li className={headerStyles['mod-login']}>
          {username ? (
            <a
              href={`https://login.${host}/logout?success=${authRedirectUrl}&failure=${authRedirectUrl}`}
            >
              {username}
              <i className="fas fa-sign-out-alt" />
            </a>
          ) : (
            <a
              href={`https://login.${host}/?success=${authRedirectUrl}&failure=${authRedirectUrl}`}
            >
              Moderator Login
            </a>
          )}
        </li>
      </ul>
    </header>
  );
}
