const mentorService = require('../../services/mentor_service');
const repo = require('../../repositories/mentor_repository');
const mailerService = require('../../services/mailer_service');
const { ConflictError, DataRequiresElevatedRoleError } = require('../../errors');

jest.mock('../../repositories/mentor_repository');
jest.mock('../../services/mailer_service');

describe('Mentor Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMentor', () => {
    it('Create mentor in pending state success', async () => {
      const userId = 42;
      const mentorData = { about: 'I am a mentor', contact: 'mentor@example.com' };
      const createdMentor = { id: 1, ...mentorData, user_id: userId, status: 'pending' };
      const adminEmails = ['admin1@example.com', 'admin2@example.com'];

      repo.getMentorByUserId.mockResolvedValue(null);
      repo.createMentor.mockResolvedValue(createdMentor);
      repo.getAdminEmails.mockResolvedValue(adminEmails);
      mailerService.notifyAdminsAboutNewApplication.mockResolvedValue();

      const result = await mentorService.createMentor(userId, mentorData);

      expect(repo.getMentorByUserId).toHaveBeenCalledWith(userId);
      expect(repo.createMentor).toHaveBeenCalledWith({
        user_id: userId,
        status: 'pending',
        about: mentorData.about,
        contact: mentorData.contact,
      });
      expect(repo.getAdminEmails).toHaveBeenCalled();
      expect(mailerService.notifyAdminsAboutNewApplication).toHaveBeenCalledWith(createdMentor, adminEmails);
      expect(result).toEqual(createdMentor);
    });

    it('Create mentor is not allowed if user already has a mentor', async () => {
      const userId = 42;
      const mentorData = { about: 'I am a mentor', contact: 'mentor@example.com' };
      const existingMentor = { id: 1, user_id: userId };
      repo.getMentorByUserId.mockResolvedValue(existingMentor);

      await expect(mentorService.createMentor(userId, mentorData)).rejects
        .toThrowError(new ConflictError('User already has a mentor profile'));

      expect(repo.getMentorByUserId).toHaveBeenCalledWith(userId);
      expect(repo.createMentor).not.toHaveBeenCalled();
      expect(mailerService.notifyAdminsAboutNewApplication).not.toHaveBeenCalled();
    });
  });

  describe('getMentorById', () => {
    it('Member users only see active mentors', async () => {
      const userRoles = [{ role_name: 'member' }];
      const mentorId = 1;
      const allowedStatuses = mentorService.memberVisibleStatuses;
      const mentor = { id: mentorId, user_id: 42, status: 'active' };

      repo.getMentorById.mockResolvedValue(mentor);

      await mentorService.getMentorById(userRoles, mentorId);

      expect(mentorService.getEligibleMentorStatuses).toHaveBeenCalledWith(userRoles);
      expect(repo.getMentorById).toHaveBeenCalledWith(allowedStatuses, expect.anything(), mentorId);
    });

    it('Admin users see all existing mentors', async () => {
      const userRoles = [{ role_name: 'member' }, { role_name: 'admin' }];
      const mentorId = 1;
      const allowedStatuses = mentorService.adminVisibleStatuses;
      const mentor = { id: mentorId, user_id: 42, status: 'active' };

      repo.getMentorById.mockResolvedValue(mentor);

      await mentorService.getMentorById(userRoles, mentorId);

      expect(mentorService.getEligibleMentorStatuses).toHaveBeenCalledWith(userRoles);
      expect(repo.getMentorById).toHaveBeenCalledWith(allowedStatuses, expect.anything(), mentorId);
    });
  });

  // describe('getMentors', () => {
  //   it('', async () => {

  //   });

  //   it('should return limited statuses for non-admin users', async () => {
  //     const userRoles = [{ role_name: 'member' }];
  //     const result = await mentorService.getEligibleMentorStatuses(userRoles);

  //     expect(result).toEqual(['active']);
  //   });
  // });
});