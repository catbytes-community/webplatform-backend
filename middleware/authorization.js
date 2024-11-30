
const roleService = require('../services/roles_service');
const repo = require('../repositories/authorization_repository');
const { respondWithError } = require('../routes/helpers');

function verifyRole(roleName) {
    return async (req, res, next) => {
        try {
            // todo: get user id from request (token?)
            const userId = 1; // temp
            const roleId = roleService.getRole(roleName);

            const userRole = await repo.verifyRole(userId, roleId);
         
            if (userRole.length === 0){
                return respondWithError(res, 403, "You're not allowed to access this resource")
            }
            next();
        } catch (err) {
            console.error('Error verifying role:', err);
            return respondWithError(res);
        }
    }
}

const OWNED_ENTITIES = {
    USER: 'users',
    MENTOR: 'mentors'
};

function verifyOwnership(entityTable) {
    return async (req, res, next) => {
        console.log("Middleware invoked for:", req.url);
        try {
            const userId = '1'; // todo: extract from request
            const resourceId = req.params.id;
    
            if (!resourceId || !userId) {
                return respondWithError(res, 400, `Invalid request: missing ${entityTable} ID or user information`);
            }
            
            let resource;
            if (entityTable === OWNED_ENTITIES.USER) {
                resource = userId === resourceId;
            } else {
                const result = await repo.verifyOwnership(entityTable, resourceId, userId);
                resource = result.rows && result.rows.length !== 0;
            }
    
            if (!resource) {
                return respondWithError(res, 403, "You're not allowed to edit this resource");
            }
    
            next();
        } catch (err) {
            console.error('Error verifying ownership:', err);
            return respondWithError(res);
        }
    }
}


module.exports = { verifyRole, verifyOwnership, OWNED_ENTITIES };