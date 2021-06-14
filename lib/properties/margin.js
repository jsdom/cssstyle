'use strict';

const {
  createShorthandGetter,
  createShorthandSetter,
  parseImplicitShorthand,
  parseKeyword,
  parseMeasurement,
  serializeImplicitShorthand,
} = require('../parsers.js');

function parse(v) {
  return parseKeyword(v, ['auto']) || parseMeasurement(v);
}

const longhands = {
  'margin-top': { parse },
  'margin-right': { parse },
  'margin-bottom': { parse },
  'margin-left': { parse },
};

module.exports.definition = {
  set: createShorthandSetter(longhands, parseImplicitShorthand),
  get: createShorthandGetter(longhands, serializeImplicitShorthand),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
module.exports.parse = parse;
module.exports.serialize = serializeImplicitShorthand;
