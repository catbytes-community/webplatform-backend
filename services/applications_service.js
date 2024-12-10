const repo = require('../repositories/applications_repository');

async function getAllApplications() {
    return await repo.getAllApplications();
}
async function createNewApplication(name, about, email, video_link, discord_nickname) {
    return await repo.createNewApplication(name, about, email, video_link, discord_nickname);
}

module.exports = { getAllApplications, createNewApplication };