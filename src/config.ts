export const host = process.env.HOST || 'localhost:3000';
export const apiBaseUrl =
  (process.env.API_BASE_URL || `http://${host}`) + '/api';

export const isProd = process.env.NODE_ENV === 'production';
export const isDev = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

export const defaultLimit = 25;
