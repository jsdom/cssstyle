'use strict';

var parsers = require('../parsers');

function parse(v) {
  if (
    parsers.valueType(v) === parsers.TYPES.KEYWORD &&
    (v.toLowerCase() === 'scroll' || v.toLowerCase() === 'fixed' || v.toLowerCase() === 'inherit')
  ) {
    return v;
  }
}

module.exports.definition = {
  set(v) {
    this._setProperty('background-attachment', parse(v));
  },
  get() {
    return this.getPropertyValue('background-attachment');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
