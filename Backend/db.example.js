const { Pool } = require("pg");

const pool = new Pool({
  user: "",
  host: "",
  database: "",
  password: "",
  port: 1111,
});

module.exports = pool;
