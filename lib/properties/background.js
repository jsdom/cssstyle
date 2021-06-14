'use strict';

const { createShorthandGetter, createShorthandSetter } = require('../parsers.js');

const longhands = {
  'background-color': require('./backgroundColor.js'),
  'background-image': require('./backgroundImage.js'),
  'background-repeat': require('./backgroundRepeat.js'),
  'background-attachment': require('./backgroundAttachment.js'),
  'background-position': require('./backgroundPosition.js'),
};

module.exports.definition = {
  set: createShorthandSetter(longhands),
  get: createShorthandGetter(longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
