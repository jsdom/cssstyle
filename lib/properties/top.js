'use strict';

const { parseLengthOrPercentage } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('top', parseLengthOrPercentage(v));
  },
  get() {
    return this.getPropertyValue('top');
  },
  enumerable: true,
  configurable: true,
};
