const mentorService = require('../../services/mentor_service');
const { MENTOR_STATUSES } = require('../../utils');
const rolesService = require('../../services/roles_service');
const mailerService = require('../../services/mailer_service');
const repo = require('../../repositories/mentor_repository');
const rolesRepo = require('../../repositories/roles_repository');
const tagsRepo = require('../../repositories/tags_repository');
const { MentorAlreadyExistsError, DataRequiresElevatedRoleError } = require('../../errors');

jest.mock('../../repositories/mentor_repository');
jest.mock('../../repositories/roles_repository');
jest.mock('../../repositories/tags_repository');
jest.mock('../../services/roles_service');
jest.mock('../../services/mailer_service');

const defaultUserId = 42;
const mockedMentorId = 1;
const mockedTags = ["React", "PHP"];

describe('Mentor Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMentor', () => {
    it('Create mentor in pending state success', async () => {
      const mentorData = { about: 'I am a mentor', contact: 'mentor@example.com', tags: mockedTags };
      const createdMentor = { id: 1, name: 'Name', about: mentorData.about, tags: mentorData.tags };
      repo.getMentorByUserId.mockResolvedValue(null);
      repo.createMentor.mockResolvedValue(createdMentor);

      const result = await mentorService.createMentor(defaultUserId, mentorData);

      expect(repo.getMentorByUserId).toHaveBeenCalledWith(defaultUserId);
      expect(repo.createMentor).toHaveBeenCalledWith({
        user_id: defaultUserId,
        status: MENTOR_STATUSES.pending,
        about: mentorData.about,
        contact: mentorData.contact,
        tags: mentorData.tags
      });
      expect(tagsRepo.updateMentorTags).toHaveBeenCalledWith(createdMentor.id, mentorData.tags);
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
    it('Unauthenticated users see active and inactive mentors with limited fields', async () => {
      const allowedStatuses = mentorService.generalVisitbleStatuses;
      const mentor = { id: 1, user_id: defaultUserId, status: MENTOR_STATUSES.active };

      rolesService.getUserRoles.mockResolvedValue();
      repo.getMentors.mockResolvedValue([mentor]);

      await mentorService.getMentors(undefined, undefined, false);

      expect(allowedStatuses).toContain(MENTOR_STATUSES.active);
      expect(allowedStatuses).toContain(MENTOR_STATUSES.inactive);
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

    it('Member users see active and inactive mentors', async () => {
      const userRoles = [{ role_name: 'member' }];
      const allowedStatuses = mentorService.generalVisitbleStatuses;
      const mentor = { id: 1, user_id: defaultUserId, status: MENTOR_STATUSES.active };

      rolesService.getUserRoles.mockResolvedValue(userRoles);
      repo.getMentors.mockResolvedValue([mentor]);

      await mentorService.getMentors(defaultUserId, undefined, false);

      expect(allowedStatuses).toContain(MENTOR_STATUSES.active);
      expect(allowedStatuses).toContain(MENTOR_STATUSES.inactive);
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

  describe('updateMentorStatus', () => {
    const mentorId = 13;
    const userId = defaultUserId;

    it('Successful status change for mentor profile owner', async () => {
      // mentor profile owner changes status from 'active' to 'inactive'
      repo.getMentorById.mockResolvedValue({
        id: mentorId,
        user_id: userId,
        status: MENTOR_STATUSES.active,
      });
      repo.updateMentorById.mockResolvedValue(mentorId);

      const result = await mentorService.updateMentorStatus(
        [{ role_name: 'member' }],
        mentorId.toString(),
        MENTOR_STATUSES.inactive,
        true // isOwner
      );

      expect(repo.updateMentorById).toHaveBeenCalledWith(mentorId.toString(), { status: MENTOR_STATUSES.inactive });
      expect(result).toBe(mentorId);
    });

    it('Successful status change for admin', async () => {
      repo.getMentorById.mockResolvedValue({
        id: mentorId,
        user_id: userId,
        status: MENTOR_STATUSES.pending,
      });

      repo.updateMentorById.mockResolvedValue(mentorId);

      const result = await mentorService.updateMentorStatus(
        [{ role_name: 'member' }, { role_name: 'admin' }],
        mentorId.toString(),
        MENTOR_STATUSES.active,
        false // isOwner
      );

      expect(repo.updateMentorById).toHaveBeenCalledWith(
        mentorId.toString(),
        { status: MENTOR_STATUSES.active }
      );
      expect(rolesRepo.assignRoleToUser).toHaveBeenCalledWith(userId, 2);
      expect(rolesRepo.removeRoleFromUser).not.toHaveBeenCalled();
      expect(result).toBe(mentorId);
    });

    it('User with no ownership nor admin role cannot make changes', async () => {
      repo.getMentorById.mockResolvedValue({
        id: mentorId,
        user_id: userId,
        status: MENTOR_STATUSES.pending,
      });

      await expect(
        mentorService.updateMentorStatus(
          [{ role_name: 'member' }],
          mentorId.toString(),
          MENTOR_STATUSES.inactive,
          false // isOwner
        )
      ).rejects.toBeInstanceOf(DataRequiresElevatedRoleError);

      expect(repo.getMentorById).toHaveBeenCalledTimes(1);
      expect(repo.updateMentorById).not.toHaveBeenCalled();
      expect(rolesRepo.assignRoleToUser).not.toHaveBeenCalled();
      expect(rolesRepo.removeRoleFromUser).not.toHaveBeenCalled();
    });

    it('User owning the profile cannot change status when current status is pending', async () => { 
      repo.getMentorById.mockResolvedValue({
        id: mentorId,
        user_id: userId,
        status: MENTOR_STATUSES.pending,
      });

      await expect(
        mentorService.updateMentorStatus(
          [{ role_name: 'member' }],
          mentorId.toString(),
          MENTOR_STATUSES.active,
          true  // isOwner
        )
      ).rejects.toBeInstanceOf(DataRequiresElevatedRoleError);

      expect(repo.updateMentorById).not.toHaveBeenCalled();
      expect(rolesRepo.assignRoleToUser).not.toHaveBeenCalled();
      expect(rolesRepo.removeRoleFromUser).not.toHaveBeenCalled();
    });

    it('User owning the profile cannot change status when current status is rejected', async () => {
      repo.getMentorById.mockResolvedValue({
        id: mentorId,
        user_id: userId,
        status: MENTOR_STATUSES.rejected,
      });

      await expect(
        mentorService.updateMentorStatus(
          [{ role_name: 'member' }],
          mentorId.toString(),
          MENTOR_STATUSES.inactive,
          true // isOwner
        )
      ).rejects.toBeInstanceOf(DataRequiresElevatedRoleError);

      expect(repo.updateMentorById).not.toHaveBeenCalled();
      expect(rolesRepo.assignRoleToUser).not.toHaveBeenCalled();
      expect(rolesRepo.removeRoleFromUser).not.toHaveBeenCalled();
    });
  });

  describe('updateMentor', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Successful update of valid field', async () => {
      repo.getMentorById.mockResolvedValue({
        id: mockedMentorId,
        user_id: defaultUserId,
        status: MENTOR_STATUSES.active,
      });
      repo.updateMentorById.mockResolvedValue(mockedMentorId);

      const result = await mentorService.updateMentor(
        [{ role_name: 'mentor' }],
        mockedMentorId.toString(),
        { about: 'new value for about field' },
        true // isOwner
      );

      expect(repo.updateMentorById).toHaveBeenCalledWith(
        mockedMentorId.toString(),
        { about: 'new value for about field' }
      );
      expect(result).toBe(mockedMentorId);
    });

    it('Successful update of more than one valid field', async () => {
      repo.getMentorById.mockResolvedValue({
        id: mockedMentorId,
        user_id: defaultUserId,
        status: MENTOR_STATUSES.inactive,
      });
      repo.updateMentorById.mockResolvedValue(mockedMentorId);

      const result = await mentorService.updateMentor(
        [{ role_name: 'mentor' }],
        mockedMentorId.toString(),
        { about: 'updated about text', contact: 'updated@example.com' },
        true // isOwner
      );

      expect(repo.updateMentorById).toHaveBeenCalledWith(
        mockedMentorId.toString(),
        { about: 'updated about text', contact: 'updated@example.com' }
      );
      expect(result).toBe(mockedMentorId);
    });

    it('Successful update of tags field', async () => {
      repo.getMentorById.mockResolvedValue({
        id: mockedMentorId,
        user_id: defaultUserId,
        status: MENTOR_STATUSES.inactive,
      });
      repo.updateMentorById.mockResolvedValue(mockedMentorId);

      const result = await mentorService.updateMentor(
        [{ role_name: 'mentor' }],
        mockedMentorId.toString(),
        { tags: mockedTags },
        true // isOwner
      );

      expect(repo.updateMentorById).not.toHaveBeenCalled();
      expect(tagsRepo.updateMentorTags).toHaveBeenCalledWith(
        mockedMentorId.toString(),
        mockedTags
      );
      expect(result).toBe(mockedMentorId);
    });

    it('Failed update if mentor status is not active or inactive', async () => {
      repo.getMentorById.mockResolvedValue({
        id: mockedMentorId,
        user_id: defaultUserId,
        status: MENTOR_STATUSES.pending,
      });

      const result = await mentorService.updateMentor(
        [{ role_name: 'member' }],
        mockedMentorId.toString(),
        { about: 'trying to change' },
      );

      expect(repo.updateMentorById).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });
});