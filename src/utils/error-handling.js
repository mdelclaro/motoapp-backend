exports.createError = (message, code, errors = null) => {
  const error = new Error(message);
  error.statusCode = code;
  if (errors) error.data = errors.array();
  return error;
};
