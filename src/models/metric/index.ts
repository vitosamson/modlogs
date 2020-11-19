import { inspect } from 'util';
import { Collection } from 'mongodb';
import { getDb, DBNames } from '../../db';
import { IMetric, MetricType } from './type';
import getLogger from '../../logger';

const logger = getLogger('metrics');
const metricsCollectionName = 'metrics';
const metricBatchTime = 5000; // how often to save batches of metrics, in ms
let pendingMetrics: IMetric[] = [];
let pendingMetricsTimeout: NodeJS.Timer;

export type { IMetric };
export { MetricType };

export async function getMetricsCollection(): Promise<Collection> {
  const db = await getDb(DBNames.internal);
  return db.collection(metricsCollectionName);
}

export async function reportMetric(metric: IMetric | IMetric[]): Promise<void> {
  const metrics = (Array.isArray(metric) ? metric : [metric]).map(
    normalizeMetric
  );
  pendingMetrics.push(...metrics);

  /**
   * save the metrics in batches since they may be reported rapidly
   */
  clearTimeout(pendingMetricsTimeout);

  // use global.setTimeout here because ts/ts-loader seems to be getting tripped up with it in the UI build,
  // erroring with: Type 'number' is not assignable to type 'Timer'.
  pendingMetricsTimeout = global.setTimeout(() => {
    commitPendingMetrics(pendingMetrics);
    pendingMetrics = [];
  }, metricBatchTime);
}

async function commitPendingMetrics(metrics: IMetric[]) {
  if (!metrics.length) return;

  const collection = await getMetricsCollection();
  try {
    await collection.insertMany(metrics);
    logger.debug(`saved ${metrics.length} metrics`);
  } catch (err) {
    logger.error(`could not add metrics. ${metrics.length} metrics were lost`);
    logger.error(inspect(err));
  }
}

function normalizeMetric(metric: IMetric): IMetric {
  return {
    ...metric,
    timestamp: metric.timestamp instanceof Date ? metric.timestamp : new Date(),
    data: metric.data || {},
  };
}

export class Metric {
  public static metricsEnabled: boolean = !!process.env.ENABLE_METRIC_REPORTING;

  constructor(
    private type: typeof MetricType[keyof typeof MetricType],
    private data?: any
  ) {
    this.start = Date.now();
  }

  private start: number;

  public report(err?: any, data?: any) {
    if (Metric.metricsEnabled) {
      reportMetric({
        type: this.type,
        timestamp: new Date(),
        duration: Date.now() - this.start,
        data: {
          ...this.data,
          data,
        },
        error: err,
      });
    }
  }
}

/**
 * in some queue jobs we kill the process once we're done working, which might cause some metrics to get lost.
 * so it's useful to be able to force any pending metrics to be saved.
 */
export async function flushPendingMetrics(): Promise<void> {
  clearTimeout(pendingMetricsTimeout);
  return commitPendingMetrics(pendingMetrics);
}
