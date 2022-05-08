export default {
  expand: true,
  notify: true,
  testMatch: [
    '<rootDir>/test/specs/**/*.spec.js',
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
