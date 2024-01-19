/**
 * @module apiError
 * Custom error class for all API operational errors
 */
class APIError extends Error {
  /**
   * @constructor
   * @param {String} message - error message
   * @param {Number} statusCode - http status code with format 4XX or 5XX
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = APIError;
