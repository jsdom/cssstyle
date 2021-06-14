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

function parse(v) {
  if (styles.indexOf(v) !== -1) {
    return v.toLowerCase();
  }
}

module.exports.definition = {
  set: implicitSetter('border', 'style', parse),
  get() {
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
module.exports.parse = parse;
