'use strict';

const { parse } = require('./margin.js');
const { subImplicitSetter } = require('../parsers.js');

module.exports.definition = {
  set: subImplicitSetter('margin', 'bottom', parse),
  get() {
    return this.getPropertyValue('margin-bottom');
  },
  enumerable: true,
  configurable: true,
};
