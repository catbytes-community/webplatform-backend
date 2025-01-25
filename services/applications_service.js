const repo = require('../repositories/applications_repository');

async function getAllApplications() {
  return await repo.getAllApplications();
}

async function createNewApplication(name, about, email, videoLink, discordNickname) {
  return await repo.createNewApplication(name, about, email, videoLink, discordNickname);
}

async function updateApplicationStatus(id, status, comment, modifiedBy, modifiedAt) {
  return await repo.updateApplicationStatus(id, status, comment, modifiedBy, modifiedAt);
}

async function getApplicationByEmail(email) {
  return await repo.getApplicationByEmail(email);
}

module.exports = { getAllApplications, createNewApplication, updateApplicationStatus, getApplicationByEmail };