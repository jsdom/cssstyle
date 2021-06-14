'use strict';

const { parse } = require('./padding.js');
const { subImplicitSetter } = require('../parsers.js');

module.exports.definition = {
  set: subImplicitSetter('padding', 'bottom', parse),
  get() {
    return this.getPropertyValue('padding-bottom');
  },
  enumerable: true,
  configurable: true,
};
