class MentorAlreadyExistsError extends Error {
  constructor(message = 'Conflict') {
    super(message);
    this.name = 'MentorAlreadyExistsError';
    this.status = 409;
  }
}

class DataRequiresElevatedRoleError extends Error {
  constructor(message = 'Data requires elevated role') {
    super(message);
    this.name = 'DataRequiresElevatedRoleError';
    this.status = 403;
  }
}

module.exports = { MentorAlreadyExistsError, DataRequiresElevatedRoleError };