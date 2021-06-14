'use strict';

const { parseBox } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('background-origin', parseBox(v));
  },
  get() {
    return this.getPropertyValue('background-origin');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parseBox;
