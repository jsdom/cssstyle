'use strict';

var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;

var shorthand_for = {
  'outline-color': require('./outlineColor'),
  'outline-style': require('./outlineStyle'),
  'outline-width': require('./outlineWidth'),
};

module.exports.definition = {
  set: shorthandSetter('outline', shorthand_for),
  get: shorthandGetter('outline', shorthand_for),
  enumerable: true,
  configurable: true,
};
