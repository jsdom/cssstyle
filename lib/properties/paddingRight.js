'use strict';

const { parse } = require('./padding.js');

module.exports.definition = {
  set(v) {
    this._setProperty('padding-right', parse(v));
  },
  get() {
    return this.getPropertyValue('padding-right');
  },
  enumerable: true,
  configurable: true,
};
