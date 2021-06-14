'use strict';

const { parseColor } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('background-color', parseColor(v));
  },
  get() {
    return this.getPropertyValue('background-color');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parseColor;
