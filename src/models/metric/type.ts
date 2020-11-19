export const MetricType = Object.freeze({
  report: 'report',
  redditApi: 'reddit_api',
} as const);
type K = keyof typeof MetricType;

export interface IMetric {
  type: typeof MetricType[K];
  timestamp?: Date;
  data?: any;
  duration?: number;
  error?: any;
}
