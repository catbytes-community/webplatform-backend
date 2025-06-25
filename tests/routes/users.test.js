const request = require('supertest');
const authService = require('../../services/auth_service');

jest.mock('../../services/auth_service');

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