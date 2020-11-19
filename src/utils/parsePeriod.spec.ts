import moment from 'moment';
import { parsePeriod } from './parsePeriod';

describe('parsePeriod', () => {
  it('returns the correct unix timestamp from the period string', () => {
    const oneDayAgo =
      moment().utc().startOf('day').subtract(1, 'day').unix() * 1000;
    expect(parsePeriod('1 day').periodTimestamp).toEqual(oneDayAgo);
    expect(parsePeriod('1 d').periodTimestamp).toEqual(oneDayAgo);
    expect(parsePeriod('1 D').periodTimestamp).toEqual(oneDayAgo);

    const fourMonthsAgo =
      moment().utc().startOf('day').subtract(1, 'month').unix() * 1000;
    expect(parsePeriod('1 month').periodTimestamp).toEqual(fourMonthsAgo);
    expect(parsePeriod('1 m').periodTimestamp).toEqual(fourMonthsAgo);
    expect(parsePeriod('1 M').periodTimestamp).toEqual(fourMonthsAgo);
  });

  it('returns the humanized period', () => {
    expect(parsePeriod('1 d').humanizedPeriod).toEqual('1 day');
    expect(parsePeriod('2 W').humanizedPeriod).toEqual('14 days');
    expect(parsePeriod('3 m').humanizedPeriod).toEqual('3 months');
  });

  it('honors maxPeriod', () => {
    const twoWeeksAgo =
      moment().utc().startOf('day').subtract(2, 'week').unix() * 1000;
    const { periodTimestamp, humanizedPeriod } = parsePeriod(
      '4 weeks',
      '2 weeks'
    );
    expect(periodTimestamp).toEqual(twoWeeksAgo);
    expect(humanizedPeriod).toEqual('14 days');
  });
});
