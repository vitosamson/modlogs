module.exports = {
  bail: true,
  transform: {
    '.(ts|tsx)': '<rootDir>/node_modules/ts-jest/preprocessor.js',
  },
  testRegex: '\\.spec\\.ts',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  mapCoverage: true,
  collectCoverageFrom: [
    'src/server/**/*.ts',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  coverageReporters: ['text', 'html'],
  globals: {
    'ts-jest': {
      tsConfigFile: 'src/server/tsconfig.json',
    },
  },
};
