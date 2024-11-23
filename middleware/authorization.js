const pool = require("../db");
const utils = require('../utils');
const { respondWithError } = require('../routes/helpers')

function verifyRole(roleName) {
    return async (req, res, next) => {
        try {
            // todo: get user id from request (token?)
            const userId = 1; // temp
            const roleId = utils.getRole(roleName);

            const userRole = await pool.query("SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2", [userId, roleId]);

            if (userRole.rows.length === 0){
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
                const query = `SELECT * FROM ${entityTable} WHERE id = $1 AND created_by = $2`;
                const result = await pool.query(query, [resourceId, userId]);
                resource = resource.rows && resource.rows.length !== 0;
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