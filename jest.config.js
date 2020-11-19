module.exports = {
  bail: true,
  transform: {
    '.(ts|tsx)': '<rootDir>/node_modules/ts-jest/preprocessor.js',
  },
  testRegex: '\\.spec\\.ts',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  mapCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  coverageReporters: ['text', 'html'],
  globals: {
    'ts-jest': {
      tsConfigFile: 'src/tsconfig.json',
    },
  },
};
