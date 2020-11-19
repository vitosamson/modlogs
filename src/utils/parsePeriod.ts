import moment from 'moment';

const getPeriodAmountAndUnit = (
  period: string
): { amount: number; unit: string } => {
  const amount = parseInt((period.match(/\d+/) || [])[0], 10) || 1;
  const unit = ((period.match(/\D+/) || [])[0] || 'month').trim();
  return { amount, unit };
};

export function parsePeriod(
  period: string,
  maxPeriod?: string
): { periodTimestamp: number; humanizedPeriod: string } {
  const today = moment().utc().startOf('day');

  let { amount: periodAmount, unit: periodUnit } = getPeriodAmountAndUnit(
    period
  );

  // some quick conversions to conform to moment's format
  // http://momentjs.com/docs/#/displaying/format/
  if (periodUnit === 'D') periodUnit = 'd';
  if (periodUnit === 'm') periodUnit = 'M';
  if (periodUnit === 'W') periodUnit = 'w';

  let duration = moment.duration(
    periodAmount,
    periodUnit as moment.unitOfTime.DurationConstructor
  );

  if (maxPeriod) {
    const { amount: maxAmount, unit: maxUnit } = getPeriodAmountAndUnit(
      maxPeriod
    );
    const maxDuration = moment.duration(
      maxAmount,
      maxUnit as moment.unitOfTime.DurationConstructor
    );

    if (duration > maxDuration) {
      duration = maxDuration;
    }
  }

  const timestamp = today.subtract(duration).unix() * 1000;
  let humanized = duration.humanize();

  if (humanized[0] === 'a') {
    humanized = humanized.replace(/a/, '1');
  }

  return {
    periodTimestamp: timestamp,
    humanizedPeriod: humanized,
  };
}
