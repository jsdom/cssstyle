'use strict';

const { parseKeyword, parseMeasurement } = require('../parsers.js');

function parse(v) {
  return parseKeyword(v, ['auto']) || parseMeasurement(v);
}

module.exports.definition = {
  set: function(v) {
    this._setProperty('flex-basis', parse(v));
  },
  get: function() {
    return this.getPropertyValue('flex-basis');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
