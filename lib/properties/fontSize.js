'use strict';

var TYPES = require('../parsers').TYPES;
var valueType = require('../parsers').valueType;
var parseMeasurement = require('../parsers').parseMeasurement;

var absoluteSizes = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];
var relativeSizes = ['larger', 'smaller'];

module.exports.isValid = function(v) {
  var type = valueType(v.toLowerCase());
  return (
    type === TYPES.LENGTH ||
    type === TYPES.PERCENT ||
    (type === TYPES.KEYWORD && absoluteSizes.indexOf(v.toLowerCase()) !== -1) ||
    (type === TYPES.KEYWORD && relativeSizes.indexOf(v.toLowerCase()) !== -1)
  );
};


function parse(v) {
  const valueAsString = String(v).toLowerCase()
  const optionalArguments = [].concat(absoluteSizes).concat(relativeSizes)
  const isOptionalArguments = optionalArguments.some(stringValue => valueAsString === stringValue.toLowerCase())
  if(isOptionalArguments) {
    return valueAsString
  }
  return parseMeasurement(v);
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
