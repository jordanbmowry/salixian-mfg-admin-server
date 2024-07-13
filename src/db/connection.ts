import knex from 'knex';
import knexfile from '../knexfile';

const env: string = process.env.NODE_ENV ?? 'development';
const config = knexfile[env];

if (!config) {
  throw new Error(
    `Knex configuration for environment '${env}' is not defined.`
  );
}

const db = knex(config);

export default db;
