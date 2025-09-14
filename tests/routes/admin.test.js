const request = require('supertest');
const rolesRepo = require('../../repositories/roles_repository');

const app = require('../../appForTests');

jest.mock('../../repositories/roles_repository');
jest.mock('../../middleware/authorization', () => {
  const actual = jest.requireActual('../../middleware/authorization');
  return {
    ...actual,
    verifyRoles: jest.fn(() => (req, res, next) => next()),
  };
});

describe('POST /admin/grant-role', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Role assignment success', async () => {
    rolesRepo.assignRoleToUser.mockResolvedValue();

    const payload = { userId: 42, roleId: 1 };
    const res = await request(app)
      .post('/admin/grant-role')
      .send(payload);

    expect(rolesRepo.assignRoleToUser).toHaveBeenCalledWith(payload.userId, payload.roleId);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Role assigned successfully');
  });

  it('Return 400 on incomplete payload data', async () => {
    const res = await request(app)
      .post('/admin/grant-role')
      .send({ userId: 42 });

    expect(rolesRepo.assignRoleToUser).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Missing userId or roleId');
  });

  it('Handle unexpected errors', async () => {
    rolesRepo.assignRoleToUser.mockRejectedValue(new Error('Unexpected error'));

    const payload = { userId: 42, roleId: 1 };
    const res = await request(app)
      .post('/admin/grant-role')
      .send(payload);

    expect(rolesRepo.assignRoleToUser).toHaveBeenCalledWith(payload.userId, payload.roleId);
    expect(res.statusCode).toBe(500);
  });
});

describe('POST /admin/revoke-role', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Role revocation success', async () => {
    rolesRepo.removeRoleFromUser.mockResolvedValue();

    const payload = { userId: 42, roleId: 1 };
    const res = await request(app)
      .post('/admin/revoke-role')
      .send(payload);

    expect(rolesRepo.removeRoleFromUser).toHaveBeenCalledWith(payload.userId, payload.roleId);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Role removed successfully');
  });

  it('Return 400 on incomplete payload data', async () => {
    const res = await request(app)
      .post('/admin/revoke-role')
      .send({ userId: 42 });

    expect(rolesRepo.removeRoleFromUser).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Missing userId or roleId');
  });

  it('Handle unexpected errors', async () => {
    rolesRepo.removeRoleFromUser.mockRejectedValue(new Error('Unexpected error'));

    const payload = { userId: 42, roleId: 1 };
    const res = await request(app)
      .post('/admin/revoke-role')
      .send(payload);

    expect(rolesRepo.removeRoleFromUser).toHaveBeenCalledWith(payload.userId, payload.roleId);
    expect(res.statusCode).toBe(500);
  });
});
