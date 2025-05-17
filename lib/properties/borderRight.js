"use strict";

const parsers = require("../parsers");
const borderTopWidth = require("./borderTopWidth");
const borderTopStyle = require("./borderTopStyle");
const borderTopColor = require("./borderTopColor");

const shorthandFor = new Map([
  ["border-right-width", borderTopWidth],
  ["border-right-style", borderTopStyle],
  ["border-right-color", borderTopColor]
]);

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    this._shorthandSetter("border-right", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("border-right", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
