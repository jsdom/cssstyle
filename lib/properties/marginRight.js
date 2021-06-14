'use strict';

const { parse } = require('./margin.js');

module.exports.definition = {
  set(v) {
    this._setProperty('margin-right', parse(v));
  },
  get() {
    return this.getPropertyValue('margin-right');
  },
  enumerable: true,
  configurable: true,
};
