'use strict';

var TYPES = require('../parsers').TYPES;
var valueType = require('../parsers').valueType;

module.exports.isValid = function isValid(v) {
  var type = valueType(v);
  return (
    (type === TYPES.KEYWORD && v.toLowerCase() === 'normal') ||
    v.toLowerCase() === 'inherit' ||
    type & (TYPES.NUMBER | TYPES.LENGTH | TYPES.PERCENT | TYPES.CALC)
  );
};

module.exports.definition = {
  set: function (v) {
    this._setProperty('line-height', v);
  },
  get: function () {
    return this.getPropertyValue('line-height');
  },
  enumerable: true,
  configurable: true,
};
