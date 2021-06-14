'use strict';

const { parse } = require('./padding.js');
const { subImplicitSetter } = require('../parsers.js');

module.exports.definition = {
  set: subImplicitSetter('padding', 'left', parse),
  get() {
    return this.getPropertyValue('padding-left');
  },
  enumerable: true,
  configurable: true,
};
