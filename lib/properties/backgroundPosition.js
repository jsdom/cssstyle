'use strict';

const { parseKeyword, parseLengthOrPercentage } = require('../parsers.js');

var valid_keywords = ['top', 'center', 'bottom', 'left', 'right'];

var parse = function parse(v) {
  var parts = v.split(/\s+/);
  if (parts.length > 2 || parts.length < 1) {
    return null;
  }
  if (parts.length === 1) {
    const value = parseLengthOrPercentage(parts[0]) || parseKeyword(parts[0], valid_keywords);
    if (value) {
      return `${value} center`;
    }
    return null;
  }
  if (parseLengthOrPercentage(parts[0]) !== null && parseLengthOrPercentage(parts[1]) !== null) {
    return v;
  }
  if (
    parseKeyword(parts[0], valid_keywords) === null ||
    parseKeyword(parts[1], valid_keywords) === null
  ) {
    return null;
  }
  return v;
};

module.exports.definition = {
  set: function(v) {
    this._setProperty('background-position', parse(v));
  },
  get: function() {
    return this.getPropertyValue('background-position');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
