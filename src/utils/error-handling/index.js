exports.createError = (message, code) => {
  const error = new Error(message);
  error.statusCode = code;
  return error;
};
