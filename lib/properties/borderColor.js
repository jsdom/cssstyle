'use strict';

const { implicitSetter, parseColor } = require('../parsers.js');

module.exports.definition = {
  set: implicitSetter('border', 'color', parseColor),
  get() {
    return this.getPropertyValue('border-color');
  },
  enumerable: true,
  configurable: true,
};
module.exports.longhands = [
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
];
module.exports.parse = parseColor;
