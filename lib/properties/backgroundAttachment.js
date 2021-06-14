'use strict';

const { parseKeyword } = require('../parsers.js');

function parse(v) {
  return parseKeyword(v, ['fixed', 'local', 'scroll']);
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
