const pool = require("../db");
const utils = require('../utils');

function verifyRole(role_name) {
    return async (req, res, next) => {
        try {
            // todo: get user id from request (token?)
            const user_id = 1; // temp
            const role_id = utils.getRole(role_name);

            const userRole = await pool.query("SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2", [user_id, role_id]);

            if (userRole.rows.length === 0){
                return res.status(403).json({ message: "You're not allowed to access this resource."})
            }
            console.log(utils.rolesCache);
            next();
        } catch (err) {
            console.error('Error verifying role:', err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

const OWNED_ENTITIES = {
    USER: 'users',
    MENTOR: 'mentors'
};

function verifyOwnership(entity_table) {
    return async (req, res, next) => {
        console.log("Middleware invoked for:", req.url);
        try {
            const user_id = 1; // todo: extract from request
            const resource_id = req.params.id;
    
            if (!resource_id || !user_id) {
                return res.status(400).json({ message: `Invalid request: missing ${entity_table} ID or user information` });
            }
            
            let resource;
            if (entity_table === OWNED_ENTITIES.USER) {
                resource = user_id === resource_id;
            } else {
                const query = `SELECT * FROM ${entity_table} WHERE id = $1 AND created_by = $2`;
                resource = await pool.query(query, [resource_id, user_id]);
            }
    
            if (!resource || resource.rows.length === 0){
                return res.status(403).json({ message: "You're not allowed to edit this resource."})
            }
    
            next();
        } catch (err) {
            console.error('Error verifying ownership:', err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}


module.exports = { verifyRole, verifyOwnership, OWNED_ENTITIES };