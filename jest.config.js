export default {
  expand: true,
  testMatch: [
    '<rootDir>/test/specs/**/*.spec.js',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/test/specs/lib/cli.spec.js',
  ],
  collectCoverageFrom: [
    'index.js',
    'lib/**',
  ],
  moduleFileExtensions: [
    'js',
    'json',
  ],
};
