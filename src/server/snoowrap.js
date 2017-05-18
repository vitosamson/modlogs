// workaround for typescript's weird module behavior

const snoowrap = require('snoowrap');
module.exports = snoowrap;
module.exports.default = snoowrap;
