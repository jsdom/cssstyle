'use strict';

const { parse } = require('./margin.js');

module.exports.definition = {
  set(v) {
    this._setProperty('margin-bottom', parse(v));
  },
  get() {
    return this.getPropertyValue('margin-bottom');
  },
  enumerable: true,
  configurable: true,
};
