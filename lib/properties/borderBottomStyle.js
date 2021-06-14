'use strict';

const { parse } = require('./borderStyle.js');

module.exports.definition = {
  set(v) {
    this._setProperty('border-bottom-style', parse(v));
  },
  get() {
    return this.getPropertyValue('border-bottom-style');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
