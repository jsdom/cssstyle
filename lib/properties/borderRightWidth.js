'use strict';

const { parse } = require('./borderWidth.js');

module.exports.definition = {
  set(v) {
    this._setProperty('border-right-width', parse(v));
  },
  get() {
    return this.getPropertyValue('border-right-width');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
