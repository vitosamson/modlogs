/**
 * This is necessary for serverside rendering of the UI. for the UI bundle build webpack handles style imports.
 * the server renderer can just ignore them.
 */

const m = require('module');
const originalLoader = m._load;

m._load = function hookedLoader(request, parent, isMain) {
  if (request.match(/.css|.scss$/)) {
    return '';
  }

  return originalLoader(request, parent, isMain);
};
