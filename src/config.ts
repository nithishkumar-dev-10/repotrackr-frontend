export interface Config {
  PORT: number;
  APP_NAME: string;
  ENV: string;
  SECRET_KEY: string;
  ACCESS_TOKEN_EXPIRE_MINUTES: number;
  REFRESH_TOKEN_EXPIRE_DAYS: number;
  VERIFY_TOKEN_EXPIRE_HOURS: number;
  RESET_TOKEN_EXPIRE_MINUTES: number;
  FRONTEND_URL: string;
  CORS_ORIGINS: string[];
}

export const config: Config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  APP_NAME: process.env.APP_NAME || 'RepoTrackr AI',
  ENV: process.env.ENV || 'dev',
  SECRET_KEY: process.env.SECRET_KEY || 'repotrackr-secret-key-super-secure-change-in-production',
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '15', 10),
  REFRESH_TOKEN_EXPIRE_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS || '7', 10),
  VERIFY_TOKEN_EXPIRE_HOURS: parseInt(process.env.VERIFY_TOKEN_EXPIRE_HOURS || '24', 10),
  RESET_TOKEN_EXPIRE_MINUTES: parseInt(process.env.RESET_TOKEN_EXPIRE_MINUTES || '30', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : ['*'],
};
