'use strict';

const { parse } = require('./padding.js');

module.exports.definition = {
  set(v) {
    this._setProperty('padding-top', parse(v));
  },
  get() {
    return this.getPropertyValue('padding-top');
  },
  enumerable: true,
  configurable: true,
};
