'use strict';

const { TYPES, parseKeyword, valueType } = require('../parsers.js');

function parse(v) {
  var type = valueType(v);
  if (
    parseKeyword(v, ['normal']) ||
    type === TYPES.NUMBER ||
    type === TYPES.LENGTH ||
    type === TYPES.PERCENT
  ) {
    return v;
  }
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
