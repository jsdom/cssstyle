'use strict';

const {
  createShorthandGetter,
  createShorthandSetter,
  parseImplicitShorthand,
  parseKeyword,
  parseLength,
  serializeImplicitShorthand,
} = require('../parsers.js');

function parse(v) {
  return parseLength(v) || parseKeyword(v, ['medium', 'thick', 'thin']);
}

const longhands = {
  'border-top-width': { parse },
  'border-right-width': { parse },
  'border-bottom-width': { parse },
  'border-left-width': { parse },
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
