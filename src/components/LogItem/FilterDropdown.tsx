import { useRouter } from 'next/router';
import React, { forwardRef, Ref } from 'react';
import { Dropdown, DropdownButtonProps } from 'react-bootstrap';
import { ILog } from '../../models/log';
import styles from './log.module.scss';

interface Props {
  log: ILog;
  isAuthenticatedMod: boolean;
}

const extractLink = (log: ILog, type: 'comment' | 'submission') => {
  const link = log.link?.endsWith('/')
    ? log.link.substr(0, log.link.length - 1)
    : log.link;

  if (type === 'submission' && !log.isSubmission) {
    return link?.substr(0, link.lastIndexOf('/'));
  }

  return link;
};

const FilterDropdownToggle = forwardRef(
  ({ children, onClick }: DropdownButtonProps, ref: Ref<HTMLSpanElement>) => (
    <span ref={ref} onClick={onClick} className={styles['filter-toggle']}>
      {children}
    </span>
  )
);

export default function FilterDropdown({ log, isAuthenticatedMod }: Props) {
  const router = useRouter();
  const filterOptions = [];
  const commentLink = extractLink(log, 'comment');
  const submissionLink = extractLink(log, 'submission');
  const author = log.author;

  const filterByLink = (link: string) => {
    router.push({
      pathname: router.pathname,
      query: {
        subreddit: router.query.subreddit,
        link,
      },
    });
  };

  const filterByAuthor = () => {
    router.push({
      query: {
        subreddit: router.query.subreddit,
        author,
      },
    });
  };

  if (log.link) {
    if (log.isComment && commentLink) {
      filterOptions.push(
        <Dropdown.Item onClick={() => filterByLink(commentLink)} key="comment">
          all logs for this comment
        </Dropdown.Item>
      );
    }

    if (submissionLink) {
      filterOptions.push(
        <Dropdown.Item
          onClick={() => filterByLink(submissionLink)}
          key="submission"
        >
          all logs for this submission
        </Dropdown.Item>
      );
    }
  }

  if (isAuthenticatedMod) {
    if (author) {
      filterOptions.push(
        <Dropdown.Item onClick={filterByAuthor} key="user">
          all logs for this user
        </Dropdown.Item>
      );
    }
  }

  if (filterOptions.length) {
    return (
      <Dropdown id="filter-by" className={styles['filter-by']}>
        <Dropdown.Toggle as={FilterDropdownToggle}>
          filter <i className="fa fa-chevron-down" />
        </Dropdown.Toggle>
        <Dropdown.Menu align="right">{filterOptions}</Dropdown.Menu>
      </Dropdown>
    );
  } else {
    return null;
  }
}
