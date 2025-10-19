const userService = require('../../services/user_service');
const repo = require('../../repositories/user_repository');

const rolesService = require('../../services/roles_service');
const mentorService = require('../../services/mentor_service');
const applicationService = require('../../services/applications_service');
const mailerService = require('../../services/mailer_service');
const s3client = require('../../aws/s3_client');
const firebaseAdmin = require('firebase-admin');

jest.mock('../../repositories/user_repository');
jest.mock('../../services/roles_service');
jest.mock('../../services/mentor_service');
jest.mock('../../services/applications_service');
jest.mock('../../services/mailer_service');
jest.mock('../../aws/s3_client');
jest.mock('firebase-admin', () => {
  return {
    auth: jest.fn().mockReturnThis(),
    deleteUser: jest.fn().mockResolvedValue(true),
  };
});

const defaultUserId = 42;

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
    
  describe('deleteUserById', () => {
    it('Delete user and associated data successfully', async () => {
      repo.getUserInfoById.mockResolvedValue({
        id: defaultUserId,
        email: 'sample@email.com',
        name: 'Sample User',
        firebase_id: 'firebase-uid-123',
        mentor_id: 7});
      applicationService.getApplicationByEmail.mockResolvedValue({ id: 3, video_filename: 'video-file.mp4' });
      mentorService.deleteMentorById.mockResolvedValue(true);
      rolesService.deleteAllUserRoles.mockResolvedValue(true);
      applicationService.deleteApplicationById.mockResolvedValue(true);
      s3client.deleteObject.mockResolvedValue(true);
      mailerService.sendUserDeletionEmail.mockResolvedValue(true);
      repo.deleteUserById.mockResolvedValue(defaultUserId);
      
      const result = await userService.deleteUserById(defaultUserId);

      expect(repo.getUserInfoById).toHaveBeenCalledWith(defaultUserId, false);
      expect(applicationService.getApplicationByEmail).toHaveBeenCalledWith('sample@email.com');
      expect(mentorService.deleteMentorById).toHaveBeenCalledWith(7);
      expect(rolesService.deleteAllUserRoles).toHaveBeenCalledWith(defaultUserId);
      expect(applicationService.deleteApplicationById).toHaveBeenCalledWith(3);
      expect(s3client.deleteObject).toHaveBeenCalledWith(s3client.BUCKET_PREFIXES.applications, 'video-file.mp4');
      expect(firebaseAdmin.auth().deleteUser).toHaveBeenCalledWith('firebase-uid-123');
      expect(mailerService.sendUserDeletionEmail).toHaveBeenCalledWith('sample@email.com', 'Sample User');
      expect(repo.deleteUserById).toHaveBeenCalledWith(defaultUserId);
      expect(result).toBe(defaultUserId);        
    });

    it('Return 0 when user does not exist', async () => {
      repo.getUserInfoById.mockResolvedValue(null);
      
      const result = await userService.deleteUserById(defaultUserId);

      expect(repo.getUserInfoById).toHaveBeenCalledWith(defaultUserId, false);
      expect(result).toBe(0);
      expect(applicationService.getApplicationByEmail).not.toHaveBeenCalled();
    });

    it('Throw error when deleting associated data fails, keep remote data', async () => {
      repo.getUserInfoById.mockResolvedValue({
        id: defaultUserId,
        email: 'sample@email.com',
        name: 'Sample User',
        firebase_id: 'firebase-uid-123',
        mentor_id: 7});
      applicationService.getApplicationByEmail.mockResolvedValue({ id: 3, video_filename: 'video-file.mp4' });
      mentorService.deleteMentorById.mockRejectedValue(new Error('DB error'));

      await userService.deleteUserById(defaultUserId).catch((error) => {
        expect(error.message).toBe('Failed to delete user associated data: DB error');
      });

      expect(repo.getUserInfoById).toHaveBeenCalledWith(defaultUserId, false);
      expect(s3client.deleteObject).not.toHaveBeenCalled();
      expect(firebaseAdmin.auth().deleteUser).not.toHaveBeenCalled();
      expect(mailerService.sendUserDeletionEmail).not.toHaveBeenCalled();
    });
  });



});