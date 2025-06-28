const request = require('supertest');
const authService = require('../../services/auth_service');
const userService = require('../../services/user_service');
// const { verifyOwnership, verifyRole } = require("../middleware/authorization");

jest.mock('../../services/auth_service');
jest.mock('../../services/user_service');
jest.mock('../../middleware/authorization', () => ({
  //verifyOwnership: () => (req, res, next) => next(),
  verifyRole: () => (req, res, next) => next(),
}));
jest.spyOn()


const app = require('../../appForTests');
const mockedUser = { firebaseId: '12345', email: 'test@example.com' };

function checkSuccessResponse(res, user) {
  expect(res.statusCode).toBe(200);
  expect(res.body.user).toEqual(user);
  expect(res.headers['set-cookie']).toBeDefined();
};

describe('POST /users/login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
      
  it('Firebase token auth success', async () => {
    authService.handleFirebaseAuth.mockResolvedValue(mockedUser);
    const res = await request(app)
      .post('/users/login')
      .set('X-Firebase-Token', 'valid-firebase-token');

    expect(authService.handleFirebaseAuth).toHaveBeenCalledWith('valid-firebase-token');
    checkSuccessResponse(res, mockedUser);
  });

  it('Discord code auth success', async () => {
    authService.handleDiscordAuth.mockResolvedValue(mockedUser);
    const res = await request(app)
      .post('/users/login')
      .set('X-Discord-Code', 'valid-discord-code');

    expect(authService.handleDiscordAuth).toHaveBeenCalledWith('valid-discord-code');
    checkSuccessResponse(res, mockedUser);
  });

  it('No auth token provided', async () => {
    const res = await request(app)
      .post('/users/login');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('No token provided or invalid token');
    expect(authService.handleFirebaseAuth).not.toHaveBeenCalled();
    expect(authService.handleDiscordAuth).not.toHaveBeenCalled();
  });

  it('Unsupported token provided', async () => {
    const res = await request(app)
      .post('/users/login')
      .set('X-Random-Token', 'invalid-token');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('No token provided or invalid token');
    expect(authService.handleFirebaseAuth).not.toHaveBeenCalled();
    expect(authService.handleDiscordAuth).not.toHaveBeenCalled();
  });

  it('Firebase auth failure', async () => {
    authService.handleFirebaseAuth.mockRejectedValue({ status: 401, message: 'Invalid Firebase token' });
    const res = await request(app)
      .post('/users/login')
      .set('X-Firebase-Token', 'invalid-firebase-token');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid Firebase token');
  });

  it('Discord auth failure', async () => {
    authService.handleDiscordAuth.mockRejectedValue({ status: 401, message: 'Invalid Discord code' });
    const res = await request(app)
      .post('/users/login')
      .set('X-Discord-Code', 'invalid-discord-code');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid Discord code');
  });
});

describe('GET /users', () => {
  it('Return all users success', async () => {
    const mockedUsers = [{ id: 1, name: 'Test User' }];
    userService.getAllUsers.mockResolvedValue(mockedUsers);

    const res = await request(app)
      .get('/users');

    expect(res.statusCode).toBe(200);
    expect(res.body.users.lenght).toBeGreaterThan(0);
    expect(res.body.users[0]['id']).toBe(1);
  });

  it('should handle errors when getting all users', async () => {
    jest.spyOn(authService, 'getAllUsers').mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer valid-token');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});