const tagsRepo = require('../repositories/tags_repository');

async function getAllTags() {
  return tagsRepo.getAllTags();
}

module.exports = {
  getAllTags,
};