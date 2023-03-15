module.exports = {
  displayName: 'product-services',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/!(*.module|*.fixture|main|example-*).{j,t}s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  resetMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
}
