'use strict';

const { createShorthandGetter, createShorthandSetter } = require('../parsers.js');

const longhands = {
  'border-top-width': require('./borderTopWidth.js'),
  'border-top-style': require('./borderTopStyle.js'),
  'border-top-color': require('./borderTopColor.js'),
};

module.exports.definition = {
  set: createShorthandSetter(longhands),
  get: createShorthandGetter(longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
