'use strict';

var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;

const longhands = {
  'border-left-width': require('./borderLeftWidth'),
  'border-left-style': require('./borderLeftStyle'),
  'border-left-color': require('./borderLeftColor'),
};

module.exports.definition = {
  set: shorthandSetter('border-left', longhands),
  get: shorthandGetter('border-left', longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
