// Validating resource id 
const isValidIntegerId = (id) => {
  const resourceId = parseInt(id, 10);
  return !isNaN(resourceId) && resourceId > 0;
};

// PostgreSQL error checks
const isUniqueConstraintViolation = (errorCode) => {
  return errorCode === '23505';
};

const isNotNullConstraintViolation = (errorCode) => {
  return errorCode === '23502';
};

function parseColumnNameFromConstraint(constraintValue, tableName) {
  try {
    return constraintValue.replace(`${tableName}_`, '').replace('_key', '');
  } catch (error) {
    return null;
  }
}

// Route helpers
const respondWithError = (res, status = 500, message = "Internal Server Error") => {
  res.status(status).json({"error": message});
};

function checkConstraintViolationOrRespondWith500(err, res, tableName) {
  const violatedValue = parseColumnNameFromConstraint(err.constraint, tableName);
  if (isUniqueConstraintViolation(err.code)) {
    return respondWithError(
      res,
      409,
      `Resource ${tableName} with this ${violatedValue} already exists`
    );
  } else if (isNotNullConstraintViolation(err.code)) {
    return respondWithError(
      res, 400, `Field ${violatedValue} is required in ${tableName}`);
  }
  respondWithError(res);
}

module.exports = { respondWithError, isValidIntegerId, isUniqueConstraintViolation, isNotNullConstraintViolation, 
  parseColumnNameFromConstraint, checkConstraintViolationOrRespondWith500 };