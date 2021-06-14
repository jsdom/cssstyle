'use strict';

const { parseKeyword, parseMeasurement } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('height', parseKeyword(v, ['auto']) || parseMeasurement(v));
  },
  get() {
    return this.getPropertyValue('height');
  },
  enumerable: true,
  configurable: true,
};
