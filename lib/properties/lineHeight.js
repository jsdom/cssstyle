'use strict';

const { parseKeyword, parseMeasurement, parseNumber } = require('../parsers.js');

function parse(v) {
  return parseKeyword(v, ['normal']) || parseNumber(v) || parseMeasurement(v);
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
