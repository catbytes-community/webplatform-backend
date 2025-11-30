const applicationsService = require('../../services/applications_service');
const repo = require('../../repositories/applications_repository');

jest.mock('../../repositories/applications_repository');

describe('Create New Application', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const testCases = [
    {
      name: 'Sets video_link to empty string if undefined',
      input: {
        email: 'test@example.com',
        discord_nickname: 'testUser',
        video_filename: 'file.mp4',
        about: 'Test',
      },
      expected: {
        video_link: '',
        video_filename: 'file.mp4',
      },
    },
    {
      name: 'Sets video_filename to empty string if undefined',
      input: {
        email: 'test@example.com',
        discord_nickname: 'testUser',
        video_link: 'https://example.com/video',
        about: 'Test',
      },
      expected: {
        video_link: 'https://example.com/video',
        video_filename: '',
      },
    },
    {
      name: 'Lowercases email before saving',
      input: {
        email: 'USER@Example.COM',
        discord_nickname: 'testUser',
        video_link: '',
        video_filename: '',
        about: 'Test',
      },
      expected: {
        email: 'user@example.com',
      },
    },
    {
      name: 'Lowercases discord_nickname before saving',
      input: {
        email: 'test@example.com',
        discord_nickname: 'Test#User',
        video_link: '',
        video_filename: '',
        about: 'Test',
      },
      expected: {
        discord_nickname: 'test#user',
      },
    },
  ];

  testCases.forEach(({ name, input, expected }) => {
    it(name, async () => {
      await applicationsService.createNewApplication({ ...input });

      expect(repo.createNewApplication).toHaveBeenCalledWith(
        expect.objectContaining(expected)
      );
    });
  });
});