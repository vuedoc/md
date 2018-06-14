module.exports = {
  expand: true,
  notify: true,
  testMatch: [
    '<rootDir>/test/specs/**/*.spec.js'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'index.js',
    'lib/**'
  ],
  moduleFileExtensions: [
    'js',
    'json'
  ]
}
