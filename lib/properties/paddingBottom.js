'use strict';

const { parse } = require('./padding.js');

module.exports.definition = {
  set(v) {
    this._setProperty('padding-bottom', parse(v));
  },
  get() {
    return this.getPropertyValue('padding-bottom');
  },
  enumerable: true,
  configurable: true,
};
