'use strict';

const { parseKeyword, parseLengthOrPercentage } = require('../parsers.js');

const sizes = [
  // Absolute
  'xx-small',
  'x-small',
  'small',
  'medium',
  'large',
  'x-large',
  'xx-large',
  // Relative
  'larger',
  'smaller',
];

function parse(v) {
  return parseKeyword(v, sizes) || parseLengthOrPercentage(v);
}

module.exports.definition = {
  set: function(v) {
    this._setProperty('font-size', parse(v));
  },
  get: function() {
    return this.getPropertyValue('font-size');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
