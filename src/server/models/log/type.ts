export interface ILog {
  _id?: string;
  timestamp: number;
  subreddit: string;
  action: string;
  redditId: string;
  details: string | null;
  description: string | null;
  isComment: boolean;
  isSubmission: boolean;
  submissionId?: string | null;
  commentId?: string | null;
  link?: string | null;
  content?: string | null;
  author?: string | null;
  title?: string | null;
  mod?: string;
}
