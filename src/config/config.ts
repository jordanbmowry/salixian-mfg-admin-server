import * as dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: number;
  developmentDatabaseUrl: string;
  productionDatabaseUrl: string;
  developmentClientBaseUrl: string;
  productionClientBaseUrl: string;
  jwtSecretKey: string;
  nodeEnv: string;
  defaultPage: number;
  defaultPageSize: number;
  basePath: string;
  defaultPagePagination: number;
  defaultPageSizePagination: number;
  isDevelopment: boolean;
}

const config: Config = {
  port: parseInt(process.env.PORT || '8080', 10),
  developmentDatabaseUrl: process.env.DEVELOPMENT_DATABASE_URL || '',
  productionDatabaseUrl: process.env.PRODUCTION_DATABASE_URL || '',
  developmentClientBaseUrl: process.env.DEVELOPMENT_CLIENT_BASE_URL || '',
  productionClientBaseUrl: process.env.PRODUCTION_CLIENT_BASE_URL || '',
  jwtSecretKey: process.env.JWT_SECRET_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultPage: parseInt(process.env.DEFAULT_PAGE || '1', 10),
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
  basePath: process.env.BASE_PATH || '/',
  defaultPagePagination: parseInt(
    process.env.DEFAULT_PAGE_PAGINATION || '1',
    10
  ),
  defaultPageSizePagination: parseInt(
    process.env.DEFAULT_PAGE_SIZE_PAGINATION || '10',
    10
  ),
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
};

export default config;
