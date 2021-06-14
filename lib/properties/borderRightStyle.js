'use strict';

const { parse } = require('./borderStyle.js');

module.exports.definition = {
  set(v) {
    if (v.toLowerCase() === 'none') {
      v = '';
      this.removeProperty('border-right-width');
    }
    this._setProperty('border-right-style', parse(v));
  },
  get() {
    return this.getPropertyValue('border-right-style');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
