'use strict';

const { createShorthandGetter, createShorthandSetter } = require('../parsers.js');

const longhands = {
  'border-bottom-width': require('./borderBottomWidth.js'),
  'border-bottom-style': require('./borderBottomStyle.js'),
  'border-bottom-color': require('./borderBottomColor.js'),
};

module.exports.definition = {
  set: createShorthandSetter(longhands),
  get: createShorthandGetter(longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
