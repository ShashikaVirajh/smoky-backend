import moment, { Moment } from 'moment';

export const getCurrentTime = (): Moment => moment();

export const formatDate = (date: moment.MomentInput, format: string, inputFormat?: string): string => {
  return moment(date, inputFormat).format(format);
};

export const formatDateToUTC = (date: moment.MomentInput, format: string): Date => {
  return new Date(moment.utc(date, format).toISOString());
};

export const addDates = (
  value: number,
  type: moment.DurationInputArg2,
  format: string,
  convertToDate = true
): string | Date => {
  const date = moment().add(value, type);
  return convertToDate ? new Date(moment.utc(date, format).toISOString()) : moment(date).format(format);
};
