'use strict';

const { implicitSetter, parseMeasurement } = require('../parsers.js');

module.exports.definition = {
  set: implicitSetter('padding', '', parseMeasurement),
  get() {
    return this.getPropertyValue('padding');
  },
  enumerable: true,
  configurable: true,
};
module.exports.longhands = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
module.exports.parse = parseMeasurement;
