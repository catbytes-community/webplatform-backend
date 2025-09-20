const { verifyRoles, verifyOwnership, OWNED_ENTITIES } = require('../../middleware/authorization');
const { ROLE_NAMES } = require("../../utils");
const utils = require('../../utils');

jest.mock('../../routes/helpers', () => ({
  respondWithError: jest.fn((res, statusCode, message) => (res.statusCode = statusCode, res.body = { error: message }, res)),
}));

jest.spyOn(utils, 'getRole').mockImplementation(() => ("rolename"));

describe('verifyRoles', () => {
  it('Returns 401 on missing userId', async () => {
    const res = {};
    const next = jest.fn();

    await verifyRoles([ROLE_NAMES.member])({}, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "User not authenticated" });
    expect(next).not.toHaveBeenCalled();
  });

  const roleCheckTestCases = [
    {
      description: 'Calls next on success for member role',
      rolesToVerify: [ROLE_NAMES.member],
      userRoles: [{ role_name: 'member', role_id: 1 }],
      expectedNextCalled: true,
    },
    {
      description: 'Calls next on success for admin role',
      rolesToVerify: [ROLE_NAMES.mentor, ROLE_NAMES.admin],
      userRoles: [{ role_name: 'admin', role_id: 3 }],
      expectedNextCalled: true,
    },
    {
      description: 'Returns 403 when user does not have the required role',
      rolesToVerify: [ROLE_NAMES.mentor, ROLE_NAMES.admin],
      userRoles: [{ role_name: 'member', role_id: 1 }],
      expectedNextCalled: false,
    },
  ];

  roleCheckTestCases.forEach(({ description, rolesToVerify, userRoles, expectedNextCalled }) => {
    it(description, async () => {
      const req = { userId: 1 };
      const res = {};
      const next = jest.fn();

      jest.spyOn(require('../../repositories/authorization_repository'), 'getRolesByUserId')
        .mockResolvedValue(userRoles);

      await verifyRoles(rolesToVerify)(req, res, next);

      if (expectedNextCalled) {
        expect(req.userRoles).toBe(userRoles);
        expect(next).toHaveBeenCalled();
      } else {
        expect(res.statusCode).toBe(403);
        expect(res.body).toEqual({ error: "You're not allowed to access this resource" });
        expect(next).not.toHaveBeenCalled();
      }
    });
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

    jest.spyOn(require('../../repositories/authorization_repository'), 'verifyOwnership').mockResolvedValue([]);

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

    jest.spyOn(require('../../repositories/authorization_repository'), 'verifyOwnership')
      .mockResolvedValue({ rows: [{ id: 2 }] });

    await verifyOwnership(OWNED_ENTITIES.MENTOR)(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});