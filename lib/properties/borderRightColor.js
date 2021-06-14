'use strict';

const { parse } = require('./borderColor.js');

module.exports.definition = {
  set(v) {
    this._setProperty('border-right-color', parse(v));
  },
  get() {
    return this.getPropertyValue('border-right-color');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
