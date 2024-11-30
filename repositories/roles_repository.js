const { getKnex } = require("../db");
 

async function getAllRoles() {
    const knex = getKnex();
    return await knex('roles').select('*');

}
module.exports = { getAllRoles };