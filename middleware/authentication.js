const userService = require('../services/user_service');
const { respondWithError } = require('../routes/helpers');
const logger = require('../logger')(__filename);

function authenticate() {
  return async (req, res, next) => {
    try {
      const userFirebaseId = req.cookies?.userUID;
      if (!userFirebaseId) {
        logger.warn(`No user UID found in request cookies at ${req.path}`);
        return next();
      }

      const user = await userService.getUserByFirebaseId(userFirebaseId);
      if (!user) {
        logger.warn('Found user UID in request cookies, but no corresponding user found in database');
        return respondWithError(res, 401, "User with provided UID not found");
      }

      req.userId = user.id;
      req.userEmail = user.email;

      next();
    } catch (err) {
      logger.error(err, 'Unexpected error while autenthicating request');
      return respondWithError(res);
    }
  };
}

module.exports = { authenticate };