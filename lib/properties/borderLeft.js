"use strict";

const borderLeftWidth = require("./borderLeftWidth");
const borderLeftStyle = require("./borderLeftStyle");
const borderLeftColor = require("./borderLeftColor");

const shorthandFor = new Map([
  ["border-left-width", borderLeftWidth],
  ["border-left-style", borderLeftStyle],
  ["border-left-color", borderLeftColor]
]);

module.exports.definition = {
  set(v) {
    this._shorthandSetter("border-left", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("border-left", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
