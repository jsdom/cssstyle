'use strict';

const {
  createShorthandGetter,
  createShorthandSetter,
  parseImplicitShorthand,
  parseKeyword,
  serializeImplicitShorthand,
} = require('../parsers.js');

const styles = [
  'none',
  'hidden',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
];

function parse(v) {
  return parseKeyword(v, styles);
}

const longhands = {
  'border-top-style': { parse },
  'border-right-style': { parse },
  'border-bottom-style': { parse },
  'border-left-style': { parse },
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
