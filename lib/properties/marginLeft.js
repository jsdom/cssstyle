'use strict';

const { parse } = require('./margin.js');

module.exports.definition = {
  set(v) {
    this._setProperty('margin-left', parse(v));
  },
  get() {
    return this.getPropertyValue('margin-left');
  },
  enumerable: true,
  configurable: true,
};
