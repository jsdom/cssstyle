'use strict';

const { parse } = require('./borderColor.js');

module.exports.definition = {
  set(v) {
    this._setProperty('border-bottom-color', parse(v));
  },
  get() {
    return this.getPropertyValue('border-bottom-color');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
