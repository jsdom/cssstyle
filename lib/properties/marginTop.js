'use strict';

const { parse } = require('./margin.js');
const { subImplicitSetter } = require('../parsers.js');

module.exports.definition = {
  set: subImplicitSetter('margin', 'top', parse),
  get() {
    return this.getPropertyValue('margin-top');
  },
  enumerable: true,
  configurable: true,
};
