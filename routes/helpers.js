// Validating resource id 
const isValidIntegetId = (id) => {
    const resourceId = parseInt(id, 10);
    return !isNaN(resourceId) && resourceId > 0;
};

module.exports = { isValidIntegetId };