const mentorService = require('../../services/mentor_service');
const { MENTOR_STATUSES } = require('../../utils');
const rolesService = require('../../services/roles_service');
const mailerService = require('../../services/mailer_service');
const repo = require('../../repositories/mentor_repository');
const { MentorAlreadyExistsError, DataRequiresElevatedRoleError } = require('../../errors');

jest.mock('../../repositories/mentor_repository');
jest.mock('../../services/roles_service');
jest.mock('../../services/mailer_service');

const defaultUserId = 42;

describe('Mentor Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMentor', () => {
    it('Create mentor in pending state success', async () => {
      const mentorData = { about: 'I am a mentor', contact: 'mentor@example.com' };
      const createdMentor = { id: 1, name: 'Name', about: mentorData.about };
      repo.getMentorByUserId.mockResolvedValue(null);
      repo.createMentor.mockResolvedValue(createdMentor);

      const result = await mentorService.createMentor(defaultUserId, mentorData);

      expect(repo.getMentorByUserId).toHaveBeenCalledWith(defaultUserId);
      expect(repo.createMentor).toHaveBeenCalledWith({
        user_id: defaultUserId,
        status: MENTOR_STATUSES.pending,
        about: mentorData.about,
        contact: mentorData.contact,
      });
      expect(rolesService.getAdminEmails).toHaveBeenCalled();
      expect(mailerService.sendEmailOnNewMentorApplication).toHaveBeenCalled();
      expect(result).toEqual(createdMentor.id);
    });

    it('Create mentor is not allowed if user already has a mentor', async () => {
      const mentorData = { about: 'I am a mentor', contact: 'mentor@example.com' };
      const existingMentor = { id: 1, user_id: defaultUserId };
      repo.getMentorByUserId.mockResolvedValue(existingMentor);
      repo.createMentor.mockResolvedValue();

      await expect(mentorService.createMentor(defaultUserId, mentorData)).rejects
        .toBeInstanceOf(MentorAlreadyExistsError);

      expect(repo.getMentorByUserId).toHaveBeenCalledWith(defaultUserId);
      expect(repo.createMentor).not.toHaveBeenCalled();
    });
  });

  describe('getMentors', () => {
    it('Unauthenticated users only see active mentors', async () => {
      const allowedStatuses = mentorService.generalVisitbleStatuses;
      const mentor = { id: 1, user_id: defaultUserId, status: MENTOR_STATUSES.active };

      rolesService.getUserRoles.mockResolvedValue();
      repo.getMentors.mockResolvedValue([mentor]);

      await mentorService.getMentors(undefined, undefined, false);

      expect(rolesService.getUserRoles).not.toHaveBeenCalled();
      expect(repo.getMentors).toHaveBeenCalledWith(allowedStatuses, mentorService.baseFields);
    });

    it('Unauthenticated users cannot see non-active mentors', async () => {
      rolesService.getUserRoles.mockResolvedValue();
      repo.getMentors.mockResolvedValue();

      expect(mentorService.getMentors(undefined, MENTOR_STATUSES.pending, false)).rejects
        .toBeInstanceOf(DataRequiresElevatedRoleError);

      expect(rolesService.getUserRoles).not.toHaveBeenCalled();
      expect(repo.getMentors).not.toHaveBeenCalled();
    });

    it('Member users only see active mentors', async () => {
      const userRoles = [{ role_name: 'member' }];
      const allowedStatuses = mentorService.generalVisitbleStatuses;
      const mentor = { id: 1, user_id: defaultUserId, status: MENTOR_STATUSES.active };

      rolesService.getUserRoles.mockResolvedValue(userRoles);
      repo.getMentors.mockResolvedValue([mentor]);

      await mentorService.getMentors(defaultUserId, undefined, false);

      expect(repo.getMentors).toHaveBeenCalledWith(allowedStatuses, mentorService.baseFields);
    });

    it('Member users only see active mentors', async () => {
      const userRoles = [{ role_name: 'member' }];
      const allowedStatuses = mentorService.generalVisitbleStatuses;
      const mentor = { id: 1, user_id: defaultUserId, status: MENTOR_STATUSES.active };

      rolesService.getUserRoles.mockResolvedValue(userRoles);
      repo.getMentors.mockResolvedValue([mentor]);

      await mentorService.getMentors(defaultUserId, undefined, false);

      expect(repo.getMentors).toHaveBeenCalledWith(allowedStatuses, mentorService.baseFields);
    });

    it('Member users cannot see non-active mentors', async () => {
      const userRoles = [{ role_name: 'member' }];
      rolesService.getUserRoles.mockResolvedValue(userRoles);
      repo.getMentors.mockResolvedValue();

      expect(mentorService.getMentors(defaultUserId, MENTOR_STATUSES.pending, false)).rejects
        .toBeInstanceOf(DataRequiresElevatedRoleError);
      
      expect(repo.getMentors).not.toHaveBeenCalled();
    });

    it('Admin users see all existing mentors', async () => {
      const userRoles = [{ role_name: 'member' }, { role_name: 'admin' }];
      const mentorId = 1;
      const allowedStatuses = mentorService.adminVisibleStatuses;
      const mentor = { id: mentorId, user_id: defaultUserId, status: MENTOR_STATUSES.active };

      rolesService.getUserRoles.mockResolvedValue(userRoles);
      repo.getMentors.mockResolvedValue([mentor]);

      await mentorService.getMentors(defaultUserId, undefined, true);

      expect(repo.getMentors).toHaveBeenCalledWith(allowedStatuses, mentorService.allFields);
    });

    it('Admin users see all existing mentors - filter by pending', async () => {
      const userRoles = [{ role_name: 'member' }, { role_name: 'admin' }];
      const mentorId = 1;
      const allowedStatuses = [MENTOR_STATUSES.pending];
      const mentor = { id: mentorId, user_id: defaultUserId, status: MENTOR_STATUSES.active };

      rolesService.getUserRoles.mockResolvedValue(userRoles);
      repo.getMentors.mockResolvedValue([mentor]);

      await mentorService.getMentors(defaultUserId, MENTOR_STATUSES.pending, true);

      expect(repo.getMentors).toHaveBeenCalledWith(allowedStatuses, mentorService.allFields);
    });
  });

  describe('getMentorById', () => {
    it('Returns mentor to member users only if active', async () => {
      const mentorId = 1;
      const allowedStatuses = mentorService.generalVisitbleStatuses;
      const userRoles = [{ role_name: 'member' }];
      const mentor = { id: mentorId, user_id: defaultUserId, status: MENTOR_STATUSES.active };

      repo.getMentorById.mockResolvedValue(mentor);

      const result = await mentorService.getMentorById(userRoles, mentorId, false);

      expect(repo.getMentorById).toHaveBeenCalledWith(allowedStatuses, mentorService.allFields, mentorId);
      expect(result).toEqual(mentor);
    });

    it('Returns mentor to owner even if not active', async () => {
      const mentorId = 1;
      const allowedStatuses = mentorService.adminVisibleStatuses;
      const userRoles = [{ role_name: 'member' }];
      const mentor = { id: mentorId, user_id: defaultUserId, status: MENTOR_STATUSES.pending };

      repo.getMentorById.mockResolvedValue(mentor);

      const result = await mentorService.getMentorById(userRoles, mentorId, true);

      expect(repo.getMentorById).toHaveBeenCalledWith(allowedStatuses, mentorService.allFields, mentorId);
      expect(result).toEqual(mentor);
    });

    it('Returns mentor to admin even if not active', async () => {
      const mentorId = 1;
      const allowedStatuses = mentorService.adminVisibleStatuses;
      const userRoles = [{ role_name: 'member' }, { role_name: 'admin' }];
      const mentor = { id: mentorId, user_id: defaultUserId, status: MENTOR_STATUSES.pending };

      repo.getMentorById.mockResolvedValue(mentor);

      const result = await mentorService.getMentorById(userRoles, mentorId, false);

      expect(repo.getMentorById).toHaveBeenCalledWith(allowedStatuses, mentorService.allFields, mentorId);
      expect(result).toEqual(mentor);
    });
  });
});