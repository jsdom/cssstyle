'use strict';

var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;

const longhands = {
  'border-top-width': require('./borderLeftWidth'),
  'border-top-style': require('./borderLeftStyle'),
  'border-top-color': require('./borderLeftColor'),
};

module.exports.definition = {
  set: shorthandSetter('border-top', longhands),
  get: shorthandGetter('border-top', longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
