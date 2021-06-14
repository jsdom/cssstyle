'use strict';

const { parse } = require('./padding.js');
const { subImplicitSetter } = require('../parsers.js');

module.exports.definition = {
  set: subImplicitSetter('padding', 'right', parse),
  get() {
    return this.getPropertyValue('padding-right');
  },
  enumerable: true,
  configurable: true,
};
