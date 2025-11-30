const { getKnex } = require("../db");

async function getAllTags() {
  const knex = getKnex();
  const names = await knex('tags').pluck('name');
  return names;
}

async function getTagByName(name) {
  const knex = getKnex();
  return await knex('tags')
    .where('name', name)
    .first();
}

async function createTag(name) {
  const knex = getKnex();
  const [{ id }] = await knex('tags')
    .insert({ name })
    .returning('id');
  return { id, name };
}

async function ensureTag(name) {
  let tag = await getTagByName(name);
  if (!tag) {
    tag = await createTag(name);
  }
  return tag;
}

async function assignTagTo(tagId, assignedId, assignedTo) {
  const knex = getKnex();
  return await knex('tags_assigned')
    .insert({ tag_id: tagId, assigned_id: assignedId, assigned_to: assignedTo });
}

async function getAssignedTagNames(assignedId, assignedTo) {
  const knex = getKnex();
  return await knex('tags_assigned as ta')
    .join('tags as t', 'ta.tag_id', 't.id')
    .where({ 'ta.assigned_id': assignedId, 'ta.assigned_to': assignedTo })
    .pluck('t.name');
}

async function updateMentorTags(mentorId, tags = []) {
  const knex = getKnex();
  const existing = await getAssignedTagNames(mentorId, 'mentor');

  const toRemove = existing.filter((name) => !tags.includes(name));
  const toAdd = tags.filter((name) => !existing.includes(name));

  if (toRemove.length) {
    await knex('tags_assigned')
      .where({ assigned_id: mentorId, assigned_to: 'mentor' })
      .whereIn(
        'tag_id',
        (qb) => qb
          .select('id')
          .from('tags')
          .whereIn('name', toRemove)
      )
      .del();
  }

  for (const name of toAdd) {
    const tag = await ensureTag(name);
    await assignTagTo(tag.id, mentorId, 'mentor');
  }

  return mentorId;
}

module.exports = {
  getAllTags,
  getTagByName,
  createTag,
  ensureTag,
  assignTagTo,
  getAssignedTagNames,
  updateMentorTags
};