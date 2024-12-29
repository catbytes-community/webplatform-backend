const usersRepo = require('../repositories/user_repository');
const { respondWithError } = require('../routes/helpers');

function authenticate() {
  return async (req, res, next) => {
    try {
        const userFirebaseId = req.cookies?.userUID;
        if (!userFirebaseId) {
            console.warn(`No user UID found in request cookies at ${req.path}`);
            return next();
        }

        const user = await usersRepo.getUserInfoByField({ firebase_id: userFirebaseId });
        if (!user) {
          console.warn(`Found user UID in request cookies, but no corresponding user found in database`);
          return respondWithError(res, 401, "User with provided UID not found");
        }

        req.userId = user.id;
        req.userEmail = user.email;

        next();
    } catch (err) {
        console.error('Unexpected error while autenthicating request:', err);
        return respondWithError(res);
    }
  }
}

module.exports = { authenticate };