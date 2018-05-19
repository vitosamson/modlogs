export interface ISubreddit {
  id: string;
  name: string;
  nameLowercase: string;
  description: string;
  shortDescription: string | null;
  title: string;
  created: number;
  subscribers: number;

  // these are stored in the db for internal use, but should not be returned to the client
  modlogConfig?: ISubredditModlogConfig;
  moderators?: string[];
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
  show_ban_user?: boolean;
  show_ban_duration?: boolean;
  show_ban_description?: boolean;
  include_actions?: string[];
  exclude_actions?: string[];
  include_moderators?: string[];
  exclude_moderators?: string[];
  show_automod_action_reasons?: boolean;
  show_muted_user?: boolean;
}
