'use strict';

const { parse } = require('./margin.js');
const { subImplicitSetter } = require('../parsers.js');

module.exports.definition = {
  set: subImplicitSetter('margin', 'right', parse),
  get() {
    return this.getPropertyValue('margin-right');
  },
  enumerable: true,
  configurable: true,
};
