'use strict';

const { parseBox } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('background-clip', parseBox(v));
  },
  get() {
    return this.getPropertyValue('background-clip');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parseBox;
