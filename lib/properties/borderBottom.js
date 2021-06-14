'use strict';

var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;

const longhands = {
  'border-bottom-width': require('./borderLeftWidth'),
  'border-bottom-style': require('./borderLeftStyle'),
  'border-bottom-color': require('./borderLeftColor'),
};

module.exports.definition = {
  set: shorthandSetter('border-bottom', longhands),
  get: shorthandGetter('border-bottom', longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
