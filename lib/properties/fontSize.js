'use strict';

const { parseMeasurement } = require('../parsers.js');

var absoluteSizes = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];
var relativeSizes = ['larger', 'smaller'];

function parse(v) {
  const lowercase = v.toLowerCase();
  const optionalArguments = absoluteSizes.concat(relativeSizes);
  const isOptionalArgument = optionalArguments.some(
    stringValue => stringValue.toLowerCase() === lowercase
  );
  return isOptionalArgument ? lowercase : parseMeasurement(v);
}

module.exports.definition = {
  set: function(v) {
    this._setProperty('font-size', parse(v));
  },
  get: function() {
    return this.getPropertyValue('font-size');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
