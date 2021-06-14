'use strict';

const { parseKeyword } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('border-collapse', parseKeyword(v, ['collapse', 'separate']));
  },
  get() {
    return this.getPropertyValue('border-collapse');
  },
  enumerable: true,
  configurable: true,
};
