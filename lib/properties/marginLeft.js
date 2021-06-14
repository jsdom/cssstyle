'use strict';

const { parse } = require('./margin.js');
const { subImplicitSetter } = require('../parsers.js');

module.exports.definition = {
  set: subImplicitSetter('margin', 'left', parse),
  get() {
    return this.getPropertyValue('margin-left');
  },
  enumerable: true,
  configurable: true,
};
