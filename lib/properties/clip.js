'use strict';

const {
  parseKeyword,
  parseLengthOrPercentage,
  splitTokens,
  whitespace,
  ws,
} = require('../parsers.js');

const shapeRegEx = new RegExp(`^rect\\(${ws}(.+)${ws}\\)$`, 'i');
const separatorRegEx = new RegExp(`,|${whitespace}`);

function parse(val) {
  const keyword = parseKeyword(val, ['auto']);
  if (keyword !== null) {
    return keyword;
  }
  const matches = val.match(shapeRegEx);
  if (!matches) {
    return null;
  }
  let [parts] = splitTokens(matches[1], separatorRegEx);
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
