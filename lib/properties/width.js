'use strict';

const { parseKeyword, parseLengthOrPercentage } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('width', parseKeyword(v, ['auto']) || parseLengthOrPercentage(v));
  },
  get() {
    return this.getPropertyValue('width');
  },
  enumerable: true,
  configurable: true,
};
