const { verifyRole, verifyOwnership, OWNED_ENTITIES } = require('../../middleware/authorization');
const { ROLE_NAMES } = require("../../utils");
const utils = require('../../utils');

jest.mock('../../routes/helpers', () => ({
  respondWithError: jest.fn((res, statusCode, message) => (res.statusCode = statusCode, res.body = { error: message }, res)),
}));

jest.spyOn(utils, 'getRole').mockImplementation((roleName) => ("rolename"));

describe('VerifyRole', () => {
  it('Returns 401 on missing userId', async () => {
    const res = {};
    const next = jest.fn();

    await verifyRole(ROLE_NAMES.member)({}, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "User not authenticated" });
    expect(next).not.toHaveBeenCalled();
  });

  it('Returns 403 on insufficient permissions', async () => {
    const req = { userId: 1 };
    const res = {};
    const next = jest.fn();

    jest.spyOn(require('../../repositories/authorization_repository'), 'verifyRole').mockResolvedValue([]);

    await verifyRole(ROLE_NAMES.member)(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "You're not allowed to access this resource" });
    expect(next).not.toHaveBeenCalled();
  });

  it('Calls next on success', async () => {
    const req = { userId: 1 };
    const res = {};
    const next = jest.fn();

    jest.spyOn(require('../../repositories/authorization_repository'), 'verifyRole').mockResolvedValue([{ id: 1, role_id: 1 }]);

    await verifyRole(ROLE_NAMES.member)(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('VerifyOwnership', () => {
  it('Returns 401 on missing userId', async () => {
    const res = {};
    const next = jest.fn();

    await verifyOwnership(OWNED_ENTITIES.USER)({}, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('Returns 400 on missing resourceId', async () => {
    const req = { userId: 1 };
    const res = {};
    const next = jest.fn();

    await verifyOwnership(OWNED_ENTITIES.USER)(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('Returns 403 on insufficient permissions for user entity', async () => {
    const req = { userId: 1, params: { id: 2 } };
    const res = {};
    const next = jest.fn();

    await verifyOwnership(OWNED_ENTITIES.USER)(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('Returns 403 on insufficient permissions for mentor entity', async () => {
    const req = { userId: 1, params: { id: 2 } };
    const res = {};
    const next = jest.fn();

    jest.spyOn(require('../../repositories/authorization_repository'), 'verifyOwnership').mockResolvedValue({});

    await verifyOwnership(OWNED_ENTITIES.MENTOR)(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('Calls next on successful ownership verification for user entity', async () => {
    const req = { userId: 1, params: { id: 1 } };
    const res = {};
    const next = jest.fn();

    await verifyOwnership(OWNED_ENTITIES.USER)(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('Calls next on successful ownership verification for mentor entity', async () => {
    const req = { userId: 1, params: { id: 2 } };
    const res = {};
    const next = jest.fn();

    jest.spyOn(require('../../repositories/authorization_repository'), 'verifyOwnership').mockResolvedValue({ rows: [{ id: 2 }] });

    await verifyOwnership(OWNED_ENTITIES.MENTOR)(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});