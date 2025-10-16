const repo = require('../repositories/applications_repository');
const { getDownloadUrl, BUCKET_PREFIXES } = require("../aws/s3_client");

async function getAllApplications() {
  return await repo.getAllApplications();
}

async function createNewApplication(payload) {
  payload.video_link = payload.video_link || '';
  payload.video_filename = payload.video_filename || '';

  return await repo.createNewApplication(payload);
}

async function updateApplicationStatus(id, status, comment, modifiedBy, modifiedAt) {
  return await repo.updateApplicationById(id, status, comment, modifiedBy, modifiedAt);
}

async function getApplicationByEmail(email) {
  return await repo.getApplicationByFields({email: email});
}

async function getApplicationById(id) {
  application = await repo.getApplicationByFields({id: id});
  if (application?.video_filename) {
    application.video_file = await getDownloadUrl(BUCKET_PREFIXES.applications, application.video_filename);
  }
  return application;
}

module.exports = { getAllApplications, createNewApplication, updateApplicationStatus, getApplicationByEmail, getApplicationById };