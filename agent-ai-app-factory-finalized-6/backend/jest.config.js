module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Ignore compiled files to avoid running tests twice
  testPathIgnorePatterns: ['/dist/']
};
