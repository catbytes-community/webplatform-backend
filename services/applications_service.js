const repo = require('../repositories/applications_repository');

async function getAllApplications() {
    return await repo.getAllApplications();
}
async function createNewApplication(name, about, email, video_link, discord_nickname) {
    return await repo.createNewApplication(name, about, email, video_link, discord_nickname);
}
async function updateApplicationStatus(id, status, comment, user_id) {
    return await repo.updateApplicationStatus(id, status, comment, user_id);
}
async function getApplicationByEmail(email) {
    return await repo.getApplicationByEmail(email);
}

module.exports = { getAllApplications, createNewApplication, updateApplicationStatus, getApplicationByEmail };