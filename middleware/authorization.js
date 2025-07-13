const utils = require('../utils');
const repo = require('../repositories/authorization_repository');
const { respondWithError } = require('../routes/helpers');
const logger = require('../logger')(__filename);

function verifyRole(roleName) {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return respondWithError(res, 401, "User not authenticated");
      }
      // Check if user is admin first
      const isAdmin = await repo.userIsAdmin(userId);
      if (isAdmin === true) 
      {
        logger.info(`Admin with userID = ${userId} accessing ${req.path}`);
        return next();
      }
      const roleId = utils.getRole(roleName);
      const userRole = await repo.verifyRole(userId, roleId);
      if (userRole.length === 0){
        return respondWithError(res, 403, "You're not allowed to access this resource");
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
      const resourceId = req.params.id;
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