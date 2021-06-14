'use strict';

const { parse } = require('./borderColor.js');

module.exports.definition = {
  set(v) {
    this._setProperty('border-left-color', parse(v));
  },
  get() {
    return this.getPropertyValue('border-left-color');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
