'use strict';

const { parseKeyword, parseMeasurement } = require('../parsers.js');

var shape_regex = /^rect\((.*)\)$/i;

function parse(val) {
  const keyword = parseKeyword(val, ['auto']);
  if (keyword !== undefined) {
    return keyword;
  }
  var matches = val.match(shape_regex);
  if (!matches) {
    return undefined;
  }
  var parts = matches[1].split(/\s*,\s*/);
  if (parts.length !== 4) {
    return undefined;
  }
  var valid = parts.every(function(part, index) {
    const measurement = parseMeasurement(part.toLowerCase());
    parts[index] = measurement;
    return measurement !== undefined;
  });
  if (!valid) {
    return undefined;
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
