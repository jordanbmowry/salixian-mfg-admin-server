import knex from 'knex';
import knexfile from '../knexfile';

const env: string = process.env.NODE_ENV ?? 'development';
const config = knexfile[env];

const db = knex(config);

export default db;
