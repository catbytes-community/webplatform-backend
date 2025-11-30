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
        req.userRoles = userRoles;
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


async function isUserEntityOwner(entityTable, resourceId, userId) {
  var ownershipField;
  switch (entityTable) {
  case OWNED_ENTITIES.USER:
    ownershipField = "id";
    break;
  case OWNED_ENTITIES.MENTOR:
    ownershipField = "user_id";
    break;
  default:
    ownershipField = "created_by";
    break;
  }
  const result = await repo.verifyOwnership(entityTable, resourceId, userId, ownershipField);
  return result.rows || result.length !== 0;
}

async function verifyMentorOwnership(mentorId, userId) {
  return isUserEntityOwner(OWNED_ENTITIES.MENTOR, mentorId, userId);
}

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
            
      let isOwner;
      if (entityTable === OWNED_ENTITIES.USER) {
        isOwner = userId.toString() === resourceId.toString();
      } else {
        isOwner = await isUserEntityOwner(entityTable, resourceId, userId);
      }
    
      if (!isOwner) {
        return respondWithError(res, 403, "You're not allowed to edit this resource");
      }
      next();
    } catch (err) {
      logger.error(err, 'Error verifying ownership');
      return respondWithError(res);
    }
  };
}


module.exports = { verifyRoles, verifyOwnership, verifyMentorOwnership, OWNED_ENTITIES };