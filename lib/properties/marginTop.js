'use strict';

const { parse } = require('./margin.js');

module.exports.definition = {
  set(v) {
    this._setProperty('margin-top', parse(v));
  },
  get() {
    return this.getPropertyValue('margin-top');
  },
  enumerable: true,
  configurable: true,
};
