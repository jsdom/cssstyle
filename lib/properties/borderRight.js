'use strict';

var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;

const longhands = {
  'border-right-width': require('./borderLeftWidth'),
  'border-right-style': require('./borderLeftStyle'),
  'border-right-color': require('./borderLeftColor'),
};

module.exports.definition = {
  set: shorthandSetter('border-right', longhands),
  get: shorthandGetter('border-right', longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
