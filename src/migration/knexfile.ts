import Dotend from 'dotenv';
Dotend.config();
const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

export default {
  // Prod is dev environment too lol
  development: {
    client: "mysql",
    connection: {
      host: DB_HOST,
      database: DB_NAME,
      user: DB_USERNAME,
      password: DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};
