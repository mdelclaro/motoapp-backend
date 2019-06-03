// config.js
module.exports = {
  privateKey: JSON.parse(process.env.PRIVATE_KEY),
  publicKey: JSON.parse(process.env.PUBLIC_KEY),
  refreshTokenPublicKey: JSON.parse(process.env.REFRESH_TOKEN_PUBLIC_KEY),
  refreshTokenPrivateKey: JSON.parse(process.env.REFRESH_TOKEN_PRIVATE_KEY),
  mongodbUrl: process.env.MONGODB_URL,
  mongodbUrlTest: process.env.MONGODB_URL_TEST,
  googleApiKey: process.env.GOOGLE_API_KEY
};
