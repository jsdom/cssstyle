'use strict';

const { parseKeyword, parseMeasurement } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('width', parseKeyword(v, ['auto']) || parseMeasurement(v));
  },
  get() {
    return this.getPropertyValue('width');
  },
  enumerable: true,
  configurable: true,
};
