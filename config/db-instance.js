require('dotenv').config();
const Sequelize = require('sequelize')

const host = process.env.NODE_ENV_DB_HOST;
const dbconnect = process.env.NODE_ENV_DB_CONNECTION;
const dbname = process.env.NODE_ENV_DB_NAME;
const port = process.env.NODE_ENV_DB_PORT;
const username = process.env.NODE_ENV_DB_USERNAME;
const password = process.env.NODE_ENV_DB_PASSWORD;

const sequelize = new Sequelize({
  database: dbname,
  username: username,
  password: password,
  host: host,
  port: port,
  dialect: dbconnect,
  dialectOptions: process.env.NODE_ENV  ?{
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
})

;(async () => {
  await sequelize.authenticate()
})()

module.exports = sequelize
