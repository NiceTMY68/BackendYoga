/**
 * Generate SQL WHERE clause from filters
 * @param {Object} filters - Filter parameters
 * @param {Array} allowedFilters - List of allowed filter fields
 * @returns {Object} - SQL where clause and parameters
 */
const generateWhereClause = (filters, allowedFilters) => {
    const conditions = [];
    const params = [];

    Object.entries(filters).forEach(([key, value]) => {
        if (allowedFilters.includes(key) && value !== undefined && value !== '') {
            conditions.push(`${key} = ?`);
            params.push(value);
        }
    });

    return {
        whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
        params
    };
};

/**
 * Generate SQL ORDER BY clause
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - asc or desc
 * @param {Array} allowedSortFields - List of allowed sort fields
 * @returns {string} - SQL order by clause
 */
const generateOrderClause = (sortBy, sortOrder, allowedSortFields) => {
    if (!sortBy || !allowedSortFields.includes(sortBy)) {
        return '';
    }
    
    const order = (sortOrder || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    return `ORDER BY ${sortBy} ${order}`;
};

module.exports = {
    generateWhereClause,
    generateOrderClause
};
