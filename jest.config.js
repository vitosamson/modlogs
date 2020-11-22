module.exports = {
  bail: true,
  testRegex: '\\.spec\\.ts',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  preset: 'ts-jest/presets/js-with-ts',
  globals: {
    'ts-jest': {
      tsconfig: 'src/tsconfig.json',
    },
  },
};
