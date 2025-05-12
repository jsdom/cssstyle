"use strict";

const TYPES = require("../parsers").TYPES;
const valueType = require("../parsers").valueType;
const parseMeasurement = require("../parsers").parseMeasurement;

const absoluteSizes = ["xx-small", "x-small", "small", "medium", "large", "x-large", "xx-large"];
const relativeSizes = ["larger", "smaller"];

module.exports.isValid = function (v) {
  const type = valueType(v.toLowerCase());
  return (
    type === TYPES.LENGTH ||
    type === TYPES.PERCENT ||
    (type === TYPES.KEYWORD && absoluteSizes.indexOf(v.toLowerCase()) !== -1) ||
    (type === TYPES.KEYWORD && relativeSizes.indexOf(v.toLowerCase()) !== -1)
  );
};

function parse(v) {
  const valueAsString = String(v).toLowerCase();
  const optionalArguments = absoluteSizes.concat(relativeSizes);
  const isOptionalArgument = optionalArguments.some(
    (stringValue) => stringValue.toLowerCase() === valueAsString
  );
  return isOptionalArgument ? valueAsString : parseMeasurement(v);
}

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("font-size", parse(v));
  },
  get() {
    return this.getPropertyValue("font-size");
  },
  enumerable: true,
  configurable: true
};
