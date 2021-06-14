'use strict';

var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;

const longhands = {
  'background-color': require('./backgroundColor'),
  'background-image': require('./backgroundImage'),
  'background-repeat': require('./backgroundRepeat'),
  'background-attachment': require('./backgroundAttachment'),
  'background-position': require('./backgroundPosition'),
};

module.exports.definition = {
  set: shorthandSetter('background', longhands),
  get: shorthandGetter('background', longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
