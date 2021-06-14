'use strict';

const {
  createShorthandGetter,
  createShorthandSetter,
  parseImplicitShorthand,
  parseMeasurement,
  serializeImplicitShorthand,
} = require('../parsers.js');

const longhands = {
  'padding-top': { parse: parseMeasurement },
  'padding-right': { parse: parseMeasurement },
  'padding-bottom': { parse: parseMeasurement },
  'padding-left': { parse: parseMeasurement },
};

module.exports.definition = {
  set: createShorthandSetter(longhands, parseImplicitShorthand),
  get: createShorthandGetter(longhands, serializeImplicitShorthand),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
module.exports.parse = parseMeasurement;
module.exports.serialize = serializeImplicitShorthand;
