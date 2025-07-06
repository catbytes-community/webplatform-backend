const repo = require('../repositories/mentor_repository');
const mailerService = require('../services/mailer_service');
const logger = require('../logger')(__filename);

async function getMentors(userId, status){
  return await repo.getMentors(userId, status);
}

async function getMentorById(userId, mentorId){
    
  return await repo.getMentorById(userId, mentorId);
}

async function createMentor(userId, mentorData) {
  try{
  // check if user already has a mentor profile
    const existingMentor = await repo.mentorAlreadyExists(userId);
    if (existingMentor) {
      throw new Error('User already has a mentor profile');
    }

    // create mentor with pending status
    const mentor = {
      user_id: userId,
      status: 'pending',
      about: mentorData.about,
      contact: mentorData.contact,
    };
    const [createdMentor] = await repo.createMentor(mentor);
    // get active mentor emails
    const activeMentorEmails = await repo.getMentorsEmails();
    // send email notification to all mentors
    try {
      await mailerService.notifyMentorsAboutNewApplication(createdMentor, activeMentorEmails);
    } catch (emailError) {
      logger.error('Failed to send mentor notification email:', emailError);
    }

    return createdMentor;
  }
  catch(err)
  {
    logger.error('Failed to create mentor:', err);
    throw err;  
  }
}

module.exports = { getMentors, getMentorById, createMentor };