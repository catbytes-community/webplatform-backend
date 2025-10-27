const { getKnex } = require("../db");
const tagsRepo = require("./tags_repository");

async function getMentors(statusesFilter, selectedFields) {
  const knex = getKnex();
  const query = knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .select(selectedFields);

  return await query.whereIn("mentors.status", statusesFilter);
}

async function getMentorByUserId(userId) {
  const knex = getKnex();
  return await knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .where("users.id", userId)
    .first();
}

async function getMentorById(allowedStatuses, selectedFields, mentorId) {
  const knex = getKnex();
  const mentor = await knex("mentors")
    .join("users", "mentors.user_id", "users.id")
    .where("mentors.id", mentorId)
    .whereIn("mentors.status", allowedStatuses)
    .select(selectedFields).first();

  const mentorTags = await tagsRepo.getAssignedTagNames(
    mentorId,
    'mentor'
  );

  mentor.tags = mentorTags;
  
  return mentor;
}

async function createMentor(mentorData) {
  const knex = getKnex();
  const { tags = [], ...data } = mentorData;

  return await knex.transaction(async (trx) => {
    const [createdMentor] = await trx("mentors")
      .insert(data)
      .returning("id");

    await updateMentorTags(createdMentor.id, tags, trx);

    const result = await trx("mentors")
      .join("users", "mentors.user_id", "users.id")
      .select("mentors.id", "users.name", "mentors.about")
      .where("mentors.id", createdMentor.id)
      .first();

    return result;
  });
}

async function updateMentorTags(mentorId, tags = [], trx) {
  const existing = await tagsRepo.getAssignedTagNames(mentorId, 'mentor', trx);

  const toRemove = existing.filter((name) => !tags.includes(name));
  const toAdd = tags.filter((name) => !existing.includes(name));

  if (toRemove.length) {
    const idsToRemove = await Promise.all(
      toRemove.map((name) =>
        tagsRepo.findTagByName(name, trx).then((t) => t.id)
      )
    );
    await tagsRepo.removeAssignments(idsToRemove, mentorId, 'mentor', trx);
  }

  for (const name of toAdd) {
    const tag = await tagsRepo.ensureTag(name, trx);
    await tagsRepo.assignTagTo(tag.id, mentorId, 'mentor', trx);
  }
}

async function updateMentorById(mentorId, updates) {
  const knex = getKnex();
  const { tags = [], ...mentorUpdates } = updates;

  return await knex.transaction(async (trx) => {
    await updateMentorTags(mentorId, tags, trx);
    // if other updates besides tags, then update mentor
    if (Object.keys(mentorUpdates).length) {
      const [mentor] = await trx("mentors")
        .where("id", mentorId)
        .update(mentorUpdates)
        .returning("id");
      return mentor.id;
    }

    return mentorId;
  })
}

async function deleteMentorById(id) {
  const knex = getKnex();
  return await knex("mentors").where("id", id).del();
}

module.exports = { getMentors, createMentor, getMentorByUserId, getMentorById, updateMentorById, deleteMentorById };