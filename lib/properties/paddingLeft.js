'use strict';

const { parse } = require('./padding.js');

module.exports.definition = {
  set(v) {
    this._setProperty('padding-left', parse(v));
  },
  get() {
    return this.getPropertyValue('padding-left');
  },
  enumerable: true,
  configurable: true,
};
