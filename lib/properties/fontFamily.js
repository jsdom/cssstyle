'use strict';

const { parseCustomIdentifier, parseString } = require('../parsers.js');

var partsRegEx = /\s*,\s*/;
function parse(v) {
  var parts = v.split(partsRegEx);
  if (parts.every((part, i) => (parts[i] = parseString(part) || parseCustomIdentifier(part)))) {
    return parts.join(', ');
  }
  return null;
}

module.exports.definition = {
  set(v) {
    this._setProperty('font-family', parse(v));
  },
  get() {
    return this.getPropertyValue('font-family');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
