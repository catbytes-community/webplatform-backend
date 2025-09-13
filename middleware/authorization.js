const utils = require('../utils');
const repo = require('../repositories/authorization_repository');
const userRepo = require('../repositories/user_repository');
const { respondWithError } = require('../routes/helpers');
const logger = require('../logger')(__filename);

function verifyRole(roleName) {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return respondWithError(res, 401, "User not authenticated");
      }
      const userRoles = await userRepo.getUserRolesById(userId);
      const result = userRoles.some(role => role.role_name === roleName || utils.ROLE_NAMES.admin);
      req.userRoles = userRoles;
      if (!result) {
        return respondWithError(res, 403, "You're not allowed to access this resource");
      }
      if (userRoles.some(role => role.role_name === utils.ROLE_NAMES.admin)) {
        logger.info(`Admin with userId=${userId} accessed ${req.path}`);
      }
      next();
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


module.exports = { verifyRole, verifyOwnership, OWNED_ENTITIES };