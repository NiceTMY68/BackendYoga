/**
 * Standard success response
 * @param {*} data - Data to send back
 * @param {string} message - Optional success message
 */
const successResponse = (data, message = 'Operation successful') => ({
    success: true,
    message,
    data
});

/**
 * Standard error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
const errorResponse = (message, statusCode = 400) => ({
    success: false,
    message,
    statusCode
});

module.exports = {
    successResponse,
    errorResponse
};
