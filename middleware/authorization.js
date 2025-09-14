const utils = require('../utils');
const repo = require('../repositories/authorization_repository');
const { respondWithError } = require('../routes/helpers');
const logger = require('../logger')(__filename);

function verifyRoles(roleNames) {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return respondWithError(res, 401, "User not authenticated");
      }
      const userRoles = await repo.getRolesByUserId(userId);

      const hasRole = roleNames.some(roleName => {
        return userRoles.some(userRole => userRole.role_name === roleName);
      });

      if (hasRole) {
        return next();
      }

      return respondWithError(res, 403, "You're not allowed to access this resource");

    } catch (err) {
      logger.error(err, 'Error verifying role');
      return respondWithError(res);
    }
  };
}

const OWNED_ENTITIES = {
  USER: 'users',
  MENTOR: 'mentors'
};

function verifyOwnership(entityTable) {
  return async (req, res, next) => {
    logger.debug(`Middleware invoked for: ${req.url}`);
    try {
      const resourceId = req.params?.id;
      const userId = req.userId;
      if (!userId) {
        return respondWithError(res, 401, "User not authenticated");
      }
    
      if (!resourceId || !userId) {
        return respondWithError(res, 400, `Invalid request: missing ${entityTable} ID or user information`);
      }
            
      let resource;
      if (entityTable === OWNED_ENTITIES.USER) {
        resource = userId.toString() === resourceId.toString();
      } else {
        const result = await repo.verifyOwnership(entityTable, resourceId, userId);
        resource = result.rows && result.length !== 0;
      }
    
      if (!resource) {
        return respondWithError(res, 403, "You're not allowed to edit this resource");
      }
    
      next();
    } catch (err) {
      logger.error(err, 'Error verifying ownership');
      return respondWithError(res);
    }
  };
}


module.exports = { verifyRoles, verifyOwnership, OWNED_ENTITIES };