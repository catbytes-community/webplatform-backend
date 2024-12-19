const repo = require('../repositories/user_repository');

async function getAllUsers() {

    return await repo.getAllUsers();
}

async function createNewUser(name, email, about, languages) {
    return await repo.createNewUser(name, email, about, languages);
}

async function getUserById(id) {
    let userInfo = await repo.getUserInfoById(id);
    if (userInfo) {
        const roles = await repo.getUserRolesById(id);
        userInfo.roles = roles.length ? roles : [];    
    }
    return userInfo;
}

async function updateUserById(id, name, about, languages) {
    return await repo.updateUserById(id, name, about, languages )   
}

async function deleteUserById(id) {
    return await repo.deleteUserById(id);
}  
async function getUserByEmail(email) {
    return await repo.getUserByEmail(email);
}
async function updateUserFirebaseId(id, firebase_id) {
    return await repo.updateUserFirebaseId(id, firebase_id);
}
module.exports = { getAllUsers, createNewUser, getUserById, updateUserById, deleteUserById, getUserByEmail, updateUserFirebaseId };