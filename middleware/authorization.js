const utils = require('../utils');
const repo = require('../repositories/authorization_repository');
const { respondWithError } = require('../routes/helpers');

function verifyRole(roleName) {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return respondWithError(res, 401, "User not authenticated");
      }

      const roleId = utils.getRole(roleName);
      const userRole = await repo.verifyRole(userId, roleId);
      if (userRole.length === 0){
        return respondWithError(res, 403, "You're not allowed to access this resource");
      }
      next();
    } catch (err) {
      console.error('Error verifying role:', err);
      return respondWithError(res);
    }
  };
}

;

const OWNED_ENTITIES = {
  USER: 'users',
  MENTOR: 'mentors'
};

function verifyOwnership(entityTable) {
  return async (req, res, next) => {
    console.log("Middleware invoked for:", req.url);
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
        resource = userId === resourceId;
      } else {
        const result = await repo.verifyOwnership(entityTable, resourceId, userId);
        resource = result.rows && result.length !== 0;
      }
    
      if (!resource) {
        return respondWithError(res, 403, "You're not allowed to edit this resource");
      }
    
      next();
    } catch (err) {
      console.error('Error verifying ownership:', err);
      return respondWithError(res);
    }
  };
}


module.exports = { verifyRole, verifyOwnership, OWNED_ENTITIES };