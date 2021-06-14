'use strict';

const { parseLengthOrPercentage } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('bottom', parseLengthOrPercentage(v));
  },
  get() {
    return this.getPropertyValue('bottom');
  },
  enumerable: true,
  configurable: true,
};
