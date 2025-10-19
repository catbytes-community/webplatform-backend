const { getKnex } = require("../db");

async function getAllTags() {
  const knex = getKnex();
  return knex('tags')
    .select('id', 'name');
}

async function findTagByName(name, trx) {
  return await (trx || getKnex())('tags')
    .where('name', name)
    .first();
}

async function createTag(name, trx) {
  const [{ id }] = await (trx || getKnex())('tags')
    .insert({ name })
    .returning('id');
  return { id, name };
}

async function ensureTag(name, trx) {
  let tag = await findTagByName(name, trx);
  if (!tag) {
    tag = await createTag(name, trx);
  }
  return tag;
}

async function assignTagTo(tagId, assignedId, assignedTo, trx) {
  return await (trx || getKnex())('tags_assigned')
    .insert({ tag_id: tagId, assigned_id: assignedId, assigned_to: assignedTo });
}

async function removeAssignments(tagIds, assignedId, assignedTo, trx) {
  if (!tagIds.length) return;
  return await (trx || getKnex())('tags_assigned')
    .where('assigned_id', assignedId)
    .andWhere('assigned_to', assignedTo)
    .whereIn('tag_id', tagIds)
    .del();
}

async function getAssignedTagNames(assignedId, assignedTo, trx) {
  return await (trx || getKnex())('tags_assigned as ta')
    .join('tags as t', 'ta.tag_id', 't.id')
    .where({ 'ta.assigned_id': assignedId, 'ta.assigned_to': assignedTo })
    .pluck('t.name');
}

module.exports = {
  getAllTags,
  findTagByName,
  createTag,
  ensureTag,
  assignTagTo,
  removeAssignments,
  getAssignedTagNames,
};