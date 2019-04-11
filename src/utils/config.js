// config.js
module.exports = {
  privateKey: process.env.PRIVATE_KEY,
  publicKey: process.env.PUBLIC_KEY,
  refreshTokenPublicKey: process.env.REFRESH_TOKEN_PUBLIC_KEY,
  refreshTokenPrivateKey: process.env.REFRESH_TOKEN_PRIVATE_KEY,
  mongodbUrl: process.env.MONGODB_URL,
  mongodbUrlTest: process.env.MONGODB_URL_TEST,
  googleApiKey: process.env.GOOGLE_API_KEY
};
