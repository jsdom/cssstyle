'use strict';

var implicitSetter = require('../parsers').implicitSetter;

// the valid border-styles:
var styles = [
  'none',
  'hidden',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
];

module.exports.isValid = function parse(v) {
  return styles.indexOf(v) !== -1;
};
var isValid = module.exports.isValid;

var parser = function(v) {
  if (isValid(v)) {
    return v.toLowerCase();
  }
  return undefined;
};

module.exports.definition = {
  set: implicitSetter('border', 'style', isValid, parser),
  get: function() {
    return this.getPropertyValue('border-style');
  },
  enumerable: true,
  configurable: true,
};
module.exports.longhands = [
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
];
