'use strict';

const { parseKeyword } = require('../parsers.js');

function parse(v) {
  return parseKeyword(v, ['normal', 'small-caps']);
}

module.exports.definition = {
  set(v) {
    this._setProperty('font-variant', parse(v));
  },
  get() {
    return this.getPropertyValue('font-variant');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
