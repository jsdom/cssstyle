'use strict';

const { parseKeyword, parseLengthOrPercentage, parseNumber } = require('../parsers.js');

function parse(v) {
  return parseKeyword(v, ['normal']) || parseNumber(v) || parseLengthOrPercentage(v);
}

module.exports.definition = {
  set(v) {
    this._setProperty('line-height', parse(v));
  },
  get() {
    return this.getPropertyValue('line-height');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
