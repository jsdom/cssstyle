'use strict';

const { parseLengthOrPercentage } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('right', parseLengthOrPercentage(v));
  },
  get() {
    return this.getPropertyValue('right');
  },
  enumerable: true,
  configurable: true,
};
