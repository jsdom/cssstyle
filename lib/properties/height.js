'use strict';

const { parseKeyword, parseLengthOrPercentage } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('height', parseKeyword(v, ['auto']) || parseLengthOrPercentage(v));
  },
  get() {
    return this.getPropertyValue('height');
  },
  enumerable: true,
  configurable: true,
};
