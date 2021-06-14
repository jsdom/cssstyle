'use strict';

const {
  createShorthandGetter,
  createShorthandSetter,
  parseImplicitShorthand,
  parseColor,
  serializeImplicitShorthand,
} = require('../parsers.js');

const longhands = {
  'border-top-color': { parse: parseColor },
  'border-right-color': { parse: parseColor },
  'border-bottom-color': { parse: parseColor },
  'border-left-color': { parse: parseColor },
};

module.exports.definition = {
  set: createShorthandSetter(longhands, parseImplicitShorthand),
  get: createShorthandGetter(longhands, serializeImplicitShorthand),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
module.exports.parse = parseColor;
module.exports.serialize = serializeImplicitShorthand;
