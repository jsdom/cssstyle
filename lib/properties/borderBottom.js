"use strict";

const parsers = require("../parsers");
const borderTopWidth = require("./borderTopWidth");
const borderTopStyle = require("./borderTopStyle");
const borderTopColor = require("./borderTopColor");

const shorthandFor = new Map([
  ["border-bottom-width", borderTopWidth],
  ["border-bottom-style", borderTopStyle],
  ["border-bottom-color", borderTopColor]
]);

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v);
    this._shorthandSetter("border-bottom", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("border-bottom", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
