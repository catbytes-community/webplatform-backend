module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  verbose: true,
  clearMocks: true, // equivalent to clearAllMocks between tests
};