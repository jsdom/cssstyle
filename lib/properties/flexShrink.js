"use strict";

const parseNumber = require("../parsers").parseNumber;
const POSITION_AT_SHORTHAND = require("../constants").POSITION_AT_SHORTHAND;

module.exports.isValid = function isValid(v, positionAtFlexShorthand) {
  return parseNumber(v) !== undefined && positionAtFlexShorthand === POSITION_AT_SHORTHAND.second;
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("flex-shrink", parseNumber(v));
  },
  get() {
    return this.getPropertyValue("flex-shrink");
  },
  enumerable: true,
  configurable: true
};
