export interface ISubreddit {
  id: string;
  name: string;
  nameLowercase: string;
  description: string;
  shortDescription: string | null;
  title: string;
  created: number;
  subscribers: number;
}

export interface ISubredditModlogConfig {
  show_comment_links?: boolean;
  show_submission_links?: boolean;
  show_comment_contents?: boolean;
  show_submission_contents?: boolean;
  show_comment_author?: boolean;
  show_submission_author?: boolean;
  show_submission_title?: boolean;
  show_moderator_name?: boolean;
  include_actions: string[];
  exclude_actions: string[];
  include_moderators: string[];
  exclude_moderators: string[];
}
