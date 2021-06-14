'use strict';

const {
  createShorthandGetter,
  createShorthandSetter,
  parseImplicitShorthand,
  parseLengthOrPercentage,
  serializeImplicitShorthand,
} = require('../parsers.js');

const longhands = {
  'padding-top': { parse: parseLengthOrPercentage },
  'padding-right': { parse: parseLengthOrPercentage },
  'padding-bottom': { parse: parseLengthOrPercentage },
  'padding-left': { parse: parseLengthOrPercentage },
};

module.exports.definition = {
  set: createShorthandSetter(longhands, parseImplicitShorthand),
  get: createShorthandGetter(longhands, serializeImplicitShorthand),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
module.exports.parse = parseLengthOrPercentage;
module.exports.serialize = serializeImplicitShorthand;
