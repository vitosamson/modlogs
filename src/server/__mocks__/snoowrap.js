// mock out snoowrap so we don't need to worry about hitting reddit during tests
const snoowrap = jest.genMockFromModule('snoowrap');
module.exports = snoowrap;
