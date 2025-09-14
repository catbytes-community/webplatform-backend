const request = require('supertest');
const mentorService = require('../../services/mentor_service');
const { MentorAlreadyExistsError, DataRequiresElevatedRoleError } = require('../../errors');

const defautlUserId = 42;
const defaultUserRoles = [{ role_name: 'member', role_id: 1 }];
const mockedMentor = { 
  id: 13,
  user_id: defautlUserId,
  contact: 'sample@test.com',
  about: 'I am a mentor',
  status: 'pending',
  created_at: '2024-01-01T00:00:00.000Z',
  last_modified_by: 10,
  last_modified_at: '2024-01-01T00:00:00.000Z',
  name: 'Test User',
};

jest.mock('../../services/auth_service');
jest.mock('../../services/mentor_service');
jest.mock('../../middleware/authorization', () => {
  const actual = jest.requireActual('../../middleware/authorization');
  return {
    ...actual,
    verifyRoles: jest.fn(() => (req, res, next) => {
      req.userId = defautlUserId;
      req.userRoles = defaultUserRoles;
      next();
    }),
  };
});

const app = require('../../appForTests');

describe('POST /mentors', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Create mentor application success', async () => {
    mentorService.createMentor.mockResolvedValue(mockedMentor);

    const payload = {
      contact: 'sample@test.com',
      about: 'I am a mentor',
    };

    const res = await request(app)
      .post('/mentors')
      .send(payload);

    expect(mentorService.createMentor).toHaveBeenCalledWith(mockedMentor.user_id, payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toStrictEqual({ mentor_id: mockedMentor.id });
  });

  it('Create mentor application - user already has mentor entity', async () => {
    mentorService.createMentor.mockRejectedValue(new MentorAlreadyExistsError('User already has a mentor profile'));
    
    const res = await request(app)
      .post('/mentors')
      .send({ contact: 'sample@test.com', about: 'I am a mentor'});

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe('User already has a mentor profile');
  });

  it('Create mentor application - unexpected error', async () => {
    mentorService.createMentor.mockRejectedValue(new Error(""));
    
    const res = await request(app)
      .post('/mentors')
      .send({ contact: 'sample@test.com', about: 'I am a mentor'});
    
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });
});

describe('GET /mentors', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get all mentors success - not authenticated', async () => {
    mentorService.getMentors.mockResolvedValue([mockedMentor]);
    const res = await request(app)
      .get('/mentors');
    
    expect(mentorService.getMentors).toHaveBeenCalledWith(undefined, undefined, false);

    expect(res.statusCode).toBe(200);
    expect(res.body.mentors.length).toBeGreaterThan(0);
  });

  it('Get all mentors success - authenticated', async () => {
    mentorService.getMentors.mockResolvedValue([mockedMentor]);
    const res = await request(app)
      .get('/mentors')
      .set('userId', defautlUserId); // simulate authenticated user
    
    expect(mentorService.getMentors).toHaveBeenCalledWith(defautlUserId, undefined, true);

    expect(res.statusCode).toBe(200);
    expect(res.body.mentors.length).toBeGreaterThan(0);
  });

  it('Get pending mentors - unauthorized', async () => {
    mentorService.getMentors
      .mockRejectedValue(new DataRequiresElevatedRoleError("You're not allowed to see mentors with this status."));
    const res = await request(app)
      .get('/mentors')
      .query({ status: 'pending' })
      .set('userId', defautlUserId); // simulate authenticated user
    
    expect(mentorService.getMentors).toHaveBeenCalledWith(defautlUserId, 'pending', true);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("You're not allowed to see mentors with this status.");
  });

  it('Get mentors - unexpected error', async () => {
    mentorService.getMentors.mockRejectedValue(new Error());
    
    const res = await request(app)
      .get('/mentors')
      .set('userId', defautlUserId); // simulate authenticated user
    
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });
});