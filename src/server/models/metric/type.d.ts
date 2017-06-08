export const enum MetricType {
  report = 'report',
  redditApi = 'reddit_api',
}

export interface IMetric {
  type: MetricType;
  timestamp?: Date;
  data?: any;
  duration?: number;
  error?: any;
}
