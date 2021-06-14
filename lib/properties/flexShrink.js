'use strict';

var parseNumber = require('../parsers').parseNumber;
var POSITION_AT_SHORTHAND = require('../constants').POSITION_AT_SHORTHAND;

function parse(v, positionAtFlexShorthand) {
  const number = parseNumber(v);
  if (number && positionAtFlexShorthand === POSITION_AT_SHORTHAND.second) {
    return number;
  }
  return null;
}

module.exports.definition = {
  set: function(v) {
    this._setProperty('flex-shrink', parseNumber(v));
  },
  get: function() {
    return this.getPropertyValue('flex-shrink');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
