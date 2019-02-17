// config.js
const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  privateKey: process.env.PRIVATE_KEY
};
