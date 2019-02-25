// config.js
const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  privateKey: process.env.PRIVATE_KEY,
  mongoPwd: process.env.DB_PASSWORD
};
