const sqlite3 = require('sqlite3').verbose();

const dotenv = require('dotenv');
dotenv.config({path: '../.env'});

module.exports = new sqlite3.Database(process.env.DATABASE_NAME);