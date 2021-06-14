'use strict';

const { createShorthandGetter, createShorthandSetter } = require('../parsers.js');

const longhands = {
  'border-left-width': require('./borderLeftWidth.js'),
  'border-left-style': require('./borderLeftStyle.js'),
  'border-left-color': require('./borderLeftColor.js'),
};

module.exports.definition = {
  set: createShorthandSetter(longhands),
  get: createShorthandGetter(longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
