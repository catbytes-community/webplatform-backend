const repo = require('../repositories/applications_repository');

async function getAllApplications() {
  return await repo.getAllApplications();
}

async function createNewApplication(name, about, email, videoLink, discordNickname) {
  return await repo.createNewApplication(name, about, email, videoLink, discordNickname);
}

async function updateApplicationStatus(id, status, comment, modifiedBy, modifiedAt) {
  return await repo.updateApplicationById(id, status, comment, modifiedBy, modifiedAt);
}

async function getApplicationByEmail(email) {
  return await repo.getApplicationByFields({email: email});
}

async function getApplicationById(id) {
  return await repo.getApplicationByFields({id: id});
}

module.exports = { getAllApplications, createNewApplication, updateApplicationStatus, getApplicationByEmail, getApplicationById };