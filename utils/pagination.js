/**
 * Generate pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 */
const getPaginationMetadata = (total, page, limit) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrevious: page > 1
});

/**
 * Get pagination parameters from request query
 * @param {object} query - Express request query object
 */
const getPaginationParams = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

module.exports = {
    getPaginationMetadata,
    getPaginationParams
};
