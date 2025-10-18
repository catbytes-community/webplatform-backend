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
// added below so PATCH mentor success route test doesn't fail
jest.mock('../../services/user_service', () => ({
  getUserById: jest.fn().mockResolvedValue({ email: 'user@test.com', name: 'Test User' }),
}));
jest.mock('../../services/mailer_service', () => ({
  sendEmailOnMentorApplicationStatusChange: jest.fn().mockResolvedValue(),
}));
jest.mock('../../middleware/authorization', () => {
  const actual = jest.requireActual('../../middleware/authorization');
  return {
    ...actual,
    verifyRoles: jest.fn(() => (req, res, next) => {
      req.userId = defautlUserId;
      req.userRoles = defaultUserRoles;
      next();
    }),
    verifyMentorOwnership: jest.fn(() => false),
    verifyOwnership: jest.fn(() => (req, res, next) => {
      req.userId = defautlUserId;
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
    mentorService.createMentor.mockResolvedValue(mockedMentor.id);

    const payload = {
      contact: 'sample@test.com',
      about: 'I am a mentor',
    };

    const res = await request(app)
      .post('/mentors')
      .send(payload);

    expect(mentorService.createMentor).toHaveBeenCalledWith(mockedMentor.user_id, payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toStrictEqual({ id: mockedMentor.id });
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

describe('GET /mentors/:id', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('Get mentor by ID success', async () => {
    mentorService.getMentorById.mockResolvedValue(mockedMentor);

    const res = await request(app)
      .get(`/mentors/${mockedMentor.id}`)
      .set('userId', defautlUserId);
    
    expect(mentorService.getMentorById).toHaveBeenCalledWith(defaultUserRoles, mockedMentor.id.toString(), false);

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual(mockedMentor);
  });

  it('Get mentor by ID - not found', async () => {
    mentorService.getMentorById.mockResolvedValue(null);
    const res = await request(app)
      .get(`/mentors/9999`)
      .set('userId', defautlUserId);
    
    expect(mentorService.getMentorById).toHaveBeenCalledWith(defaultUserRoles, "9999", false);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Mentor not found');
  });

  it('Get mentor by ID - unexpected error', async () => {
    mentorService.getMentorById.mockRejectedValue(new Error());
    
    const res = await request(app)
      .get(`/mentors/${mockedMentor.id}`)
      .set('userId', defautlUserId);
    
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });
});

describe('PATCH /mentors/:id', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Update mentor status success', async () => {
    mentorService.getMentorById.mockResolvedValue({ ...mockedMentor });
    mentorService.updateMentorStatus.mockResolvedValue(mockedMentor.id);

    const res = await request(app)
      .patch(`/mentors/${mockedMentor.id}`)
      .send({ status: 'active' })
      .set('userId', defautlUserId);

    expect(mentorService.updateMentorStatus)
      .toHaveBeenCalledWith(defaultUserRoles, mockedMentor.id.toString(), 'active', false);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toStrictEqual(mockedMentor.id);
  });

  it('Update mentor status - not authorized', async () => {
    mentorService.getMentorById.mockResolvedValue({ ...mockedMentor });
    mentorService.updateMentorStatus.mockRejectedValue(
      new DataRequiresElevatedRoleError("You're not allowed to edit this resource")
    );

    const res = await request(app)
      .patch(`/mentors/${mockedMentor.id}`)
      .send({ status: 'rejected' })
      .set('userId', defautlUserId);
    
    expect(mentorService.updateMentorStatus)
      .toHaveBeenCalledWith(defaultUserRoles, mockedMentor.id.toString(), 'rejected', false);
    
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("You're not allowed to edit this resource");
  });

  it('Update mentor status - mentor not found', async () => {
    mentorService.getMentorById.mockResolvedValue(null);

    const res = await request(app)
      .patch('/mentors/9999') // some non-existing mentorId
      .send({ status: 'active' })
      .set('userId', defautlUserId);
    
    expect(mentorService.getMentorById)
      .toHaveBeenCalledWith(defaultUserRoles, '9999', false);
    
    expect(mentorService.updateMentorStatus).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Mentor not found');
  });
});

describe('PUT /mentors/:id', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Update mentor success', async () => {
    mentorService.updateMentor.mockResolvedValue(mockedMentor.id);

    const res = await request(app)
      .put(`/mentors/${mockedMentor.id}`)
      .send({ about: 'updated about field', contact: 'updated@email.com' });

    expect(mentorService.updateMentor).toHaveBeenCalledWith(
      defaultUserRoles,
      mockedMentor.id.toString(),
      { about: 'updated about field', contact: 'updated@email.com' }
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({ id: mockedMentor.id });
  });
  it('Update mentor - invalid field', async () => {
    const res = await request(app)
      .put(`/mentors/${mockedMentor.id}`)
      .send({ name: 'new name' });

    expect(res.statusCode).toBe(400);
    expect(mentorService.updateMentor).not.toHaveBeenCalled();
  });
  it('Update mentor - not authorized', async () => {
    mentorService.updateMentor.mockRejectedValue(
      new DataRequiresElevatedRoleError("You're not allowed to edit this resource")
    );

    const res = await request(app)
      .put(`/mentors/${mockedMentor.id}`)
      .set('userId', defautlUserId)
      .send({ about: 'new about that will not be applied', contact: 'new contact' });

    expect(mentorService.updateMentor).toHaveBeenCalledWith(
      defaultUserRoles,
      mockedMentor.id.toString(),
      { about: 'new about that will not be applied', contact: 'new contact' }
    );

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("You're not allowed to edit this resource");
  });
});