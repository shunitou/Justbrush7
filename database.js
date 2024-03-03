// database.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'gyrketyk',
  host: 'flora.db.elephantsql.com',
  database: 'gyrketyk',
  password: '7X6Qo7DrpxVhDDh5JPIOAkEtHNauny6p',
  port: 5432,
});

module.exports = pool;