// This is a hack to run a "test" that will seed our test data so it can be verified with curl/postman
module.exports = {
  displayName: 'product-services',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'seed-test-data.ts',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  resetMocks: true,
}
