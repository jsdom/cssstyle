'use strict';

const { parse } = require('./borderStyle.js');

module.exports.definition = {
  set(v) {
    this._setProperty('border-left-style', parse(v));
  },
  get() {
    return this.getPropertyValue('border-left-style');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
