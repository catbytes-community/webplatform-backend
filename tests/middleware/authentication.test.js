const { authenticate } = require('../../middleware/authentication');
const { respondWithError } = require('../../routes/helpers');
const userService = require('../../services/user_service');

jest.mock('../../services/user_service');
jest.mock('../../routes/helpers', () => ({
  respondWithError: jest.fn((res, statusCode, message) => {
    if (statusCode && message) {
      res.statusCode = statusCode;
      res.body = { error: message };
    } else {
      res.statusCode = 500;
      res.body = { error: 'Internal Server Error' };
    }
    return res;
  }),
}));

describe('Authenticate', () => {
  it('Successful authentication sets user info in req', async () => {
    const req = { cookies: { userUID: 'valid-uid' } };
    const res = {};
    const next = jest.fn();
    const user = { id: 42, email: 'test@test.com' };
    userService.getUserByFirebaseId.mockResolvedValue(user);
    
    await authenticate()(req, res, next);

    expect(userService.getUserByFirebaseId).toHaveBeenCalledWith('valid-uid');
    expect(req.userId).toBe(user.id);
    expect(req.userEmail).toBe(user.email);
    expect(next).toHaveBeenCalled();
  });
  
  it('Missing UID in cookies continues request without authentication', async () => {
    const res = {};
    const next = jest.fn();
    await authenticate()({}, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBeUndefined();
    expect(respondWithError).not.toHaveBeenCalled();
  });

  it('Returns 401 if user not found in database', async () => {
    const req = { cookies: { userUID: 'nonexistent-uid' } };
    const res = {};
    const next = jest.fn();
    userService.getUserByFirebaseId.mockResolvedValue(null);
    
    await authenticate()(req, res, next);

    expect(userService.getUserByFirebaseId).toHaveBeenCalledWith('nonexistent-uid');
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "User with provided UID not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it('Unexpected error handled properly', async () => {
    const req = { cookies: { userUID: 'valid-uid' } };
    const res = {};
    const next = jest.fn();
    userService.getUserByFirebaseId.mockRejectedValue(new Error('Database error'));

    await authenticate()(req, res, next);

    expect(userService.getUserByFirebaseId).toHaveBeenCalledWith('valid-uid');
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
    expect(next).not.toHaveBeenCalled();
  });
});