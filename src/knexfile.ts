import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
  NODE_ENV = 'development',
  DEVELOPMENT_DATABASE_URL,
  PRODUCTION_DATABASE_URL,
} = process.env;

if (!DEVELOPMENT_DATABASE_URL) {
  throw new Error(
    'DEVELOPMENT_DATABASE_URL is not defined in the environment variables.'
  );
}

if (!PRODUCTION_DATABASE_URL) {
  throw new Error(
    'PRODUCTION_DATABASE_URL is not defined in the environment variables.'
  );
}

const DB_URL: string =
  NODE_ENV === 'production'
    ? PRODUCTION_DATABASE_URL
    : DEVELOPMENT_DATABASE_URL;

interface MyKnexConfig {
  [key: string]: {
    client: string;
    connection: string;
    pool: { min: number; max: number; idleTimeoutMillis?: number };
    migrations: { directory: string };
    seeds: { directory: string };
  };
}

const config: MyKnexConfig = {
  development: {
    client: 'postgresql',
    connection: DB_URL,
    pool: {
      min: 1,
      max: 20,
      idleTimeoutMillis: 30000,
    },
    migrations: {
      directory: path.join(__dirname, 'db', 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'db', 'seeds'),
    },
  },
  production: {
    client: 'postgresql',
    connection: DB_URL,
    pool: {
      min: 1,
      max: 20,
      idleTimeoutMillis: 30000,
    },
    migrations: {
      directory: path.join(__dirname, 'db', 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'db', 'seeds'),
    },
  },
};

export default config;
