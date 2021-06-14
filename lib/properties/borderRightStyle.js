'use strict';

const { parse } = require('./borderStyle.js');

module.exports.definition = {
  set(v) {
    this._setProperty('border-right-style', parse(v));
  },
  get() {
    return this.getPropertyValue('border-right-style');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
