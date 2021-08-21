import knex from 'knex';

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

const dbPool = knex({
  client: 'mysql',
  connection: {
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
  pool: { min: 0, max: 10 }
});

function ensureConnectToDB() {
  return dbPool.raw('Select 1'); // DB ping
}

export {
  dbPool,
  ensureConnectToDB
};
