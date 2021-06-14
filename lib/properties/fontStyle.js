'use strict';

const { parseKeyword } = require('../parsers.js');

function parse(v) {
  return parseKeyword(v, ['italic', 'normal', 'oblique']);
}

module.exports.definition = {
  set(v) {
    this._setProperty('font-style', parse(v));
  },
  get() {
    return this.getPropertyValue('font-style');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
