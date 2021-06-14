'use strict';

const { parse } = require('./borderWidth.js');

module.exports.definition = {
  set(v) {
    this._setProperty('border-left-width', parse(v));
  },
  get() {
    return this.getPropertyValue('border-left-width');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
