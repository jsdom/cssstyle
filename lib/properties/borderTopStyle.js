'use strict';

const { parse } = require('./borderStyle.js');

module.exports.definition = {
  set(v) {
    if (v.toLowerCase() === 'none') {
      v = '';
      this.removeProperty('border-top-width');
    }
    this._setProperty('border-top-style', parse(v));
  },
  get() {
    return this.getPropertyValue('border-top-style');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
