"use strict";

const parsers = require("../parsers");
const borderTopWidth = require("./borderTopWidth");
const borderTopStyle = require("./borderTopStyle");
const borderTopColor = require("./borderTopColor");

const shorthandFor = new Map([
  ["border-left-width", borderTopWidth],
  ["border-left-style", borderTopStyle],
  ["border-left-color", borderTopColor]
]);

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    this._shorthandSetter("border-left", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("border-left", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
