'use strict';

const { parseKeyword, parseLengthOrPercentage } = require('../parsers.js');

var shape_regex = /^rect\((.*)\)$/i;

function parse(val) {
  const keyword = parseKeyword(val, ['auto']);
  if (keyword !== null) {
    return keyword;
  }
  var matches = val.match(shape_regex);
  if (!matches) {
    return null;
  }
  var parts = matches[1].split(/\s*,\s*/);
  if (parts.length !== 4) {
    return null;
  }
  var valid = parts.every(function(part, index) {
    const measurement = parseLengthOrPercentage(part);
    parts[index] = measurement;
    return measurement !== null;
  });
  if (!valid) {
    return null;
  }
  parts = parts.join(', ');
  return val.replace(matches[1], parts);
}

module.exports.definition = {
  set: function(v) {
    this._setProperty('clip', parse(v));
  },
  get: function() {
    return this.getPropertyValue('clip');
  },
  enumerable: true,
  configurable: true,
};
