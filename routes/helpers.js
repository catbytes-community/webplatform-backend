// Route helpers
const respondWithError = (res, status = 500, message = "Internal Server Error") => {
    res.status(status).json({"error": message});
}

// Validating resource id 
const isValidIntegerId = (id) => {
    const resourceId = parseInt(id, 10);
    return !isNaN(resourceId) && resourceId > 0;
};

// PostgreSQL error checks
const isUniqueConstraintViolation = (error_code) => {
    return error_code === '23505';
}

const isNotNullConstraintViolation = (error_code) => {
    return error_code === '23502';
}

module.exports = { respondWithError, isValidIntegerId, isUniqueConstraintViolation, isNotNullConstraintViolation };