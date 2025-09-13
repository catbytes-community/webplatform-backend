const request = require('supertest');
const mentorService = require('../../services/mentor_service');

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
    verifyRole: jest.fn(() => (req, res, next) => {
      req.userId = defautlUserId;
      req.userRoles = defaultUserRoles;
      next()}),
  };
});

const app = require('../../appForTests');

describe('POST /mentors', () => {
  afterEach(() => {
      jest.clearAllMocks();
    });

  it('Create mentor application success', async () => {
    mentorService.createMentor.mockResolvedValue(mockedMentor);

    payload = {
      contact: 'sample@test.com',
      about: 'I am a mentor',
    }
    const res = await request(app)
      .post('/mentors')
      .send(payload);

    expect(mentorService.createMentor).toHaveBeenCalledWith(mockedMentor.user_id, payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toBe({ id: mockedMentor.id });
  });

  // todo: add tests for conflict and 500
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

  // todo: add tests for 403 and 500
});

describe('GET /mentors/:id', () => {
  it('Get mentor by ID success', async () => {
    mentorService.getMentorById.mockResolvedValue(mockedMentor);

    const res = await request(app)
      .get('/mentors/1');

    expect(mentorService.getMentorById).toHaveBeenCalledWith(defaultUserRoles, '1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockedMentor);
  });

  it('Get mentor by ID not found', async () => {
    mentorService.getMentorById.mockResolvedValue(null);

    const res = await request(app)
      .get('/mentors/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Mentor not found');
  });
});