'use strict';

var TYPES = require('../parsers').TYPES;
var valueType = require('../parsers').valueType;

function parse(v) {
  var type = valueType(v);
  if (
    (type === TYPES.KEYWORD && v.toLowerCase() === 'normal') ||
    v.toLowerCase() === 'inherit' ||
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
