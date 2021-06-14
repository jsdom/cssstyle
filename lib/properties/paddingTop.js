'use strict';

const { parse } = require('./padding.js');
const { subImplicitSetter } = require('../parsers.js');

module.exports.definition = {
  set: subImplicitSetter('padding', 'top', parse),
  get() {
    return this.getPropertyValue('padding-top');
  },
  enumerable: true,
  configurable: true,
};
