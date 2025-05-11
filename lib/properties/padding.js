"use strict";

var parsers = require("../parsers");
var TYPES = parsers.TYPES;

module.exports.isValid = function (v) {
  var type = parsers.valueType(v);
  return (
    type === TYPES.NULL_OR_EMPTY_STR ||
    type === TYPES.LENGTH ||
    type === TYPES.PERCENT ||
    type === TYPES.CALC ||
    (type === TYPES.NUMBER && parseFloat(v) === 0)
  );
};

module.exports.parser = function parser(v) {
  return parsers.parseMeasurement(v);
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (typeof v === "number") {
      v = String(v);
    }
    if (v === null) {
      v = "";
    }
    if (typeof v !== "string") {
      return;
    }
    v = v.toLowerCase();
    switch (v) {
      case "inherit":
      case "initial":
      case "unset":
      case "": {
        this._implicitSetter(
          "padding",
          "",
          v,
          function () {
            return true;
          },
          function (val) {
            return val;
          }
        );
        break;
      }
      default: {
        this._implicitSetter("padding", "", v, module.exports.isValid, module.exports.parser);
      }
    }
  },
  get() {
    return this.getPropertyValue("padding");
  },
  enumerable: true,
  configurable: true
};
