'use strict';

const { parse } = require('./borderColor.js');

module.exports.definition = {
  set(v) {
    this._setProperty('border-top-color', parse(v));
  },
  get() {
    return this.getPropertyValue('border-top-color');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
