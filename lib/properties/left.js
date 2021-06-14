'use strict';

const { parseLengthOrPercentage } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('left', parseLengthOrPercentage(v));
  },
  get() {
    return this.getPropertyValue('left');
  },
  enumerable: true,
  configurable: true,
};
