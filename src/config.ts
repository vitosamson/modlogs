export const host = process.env.HOST || 'localhost:3000';
export const apiBaseUrl =
  (process.env.API_BASE_URL || `http://${host}`) + '/api';

export const isDev = process.env.NODE_ENV === 'development';

export const defaultLimit = 25;
