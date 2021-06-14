'use strict';

const { parseKeyword } = require('../parsers.js');

module.exports.definition = {
  set(v) {
    this._setProperty('clear', parseKeyword(v, ['both', 'left', 'none', 'right']));
  },
  get() {
    return this.getPropertyValue('clear');
  },
  enumerable: true,
  configurable: true,
};
