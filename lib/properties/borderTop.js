"use strict";

const borderTopWidth = require("./borderTopWidth");
const borderTopStyle = require("./borderTopStyle");
const borderTopColor = require("./borderTopColor");

const shorthandFor = new Map([
  ["border-top-width", borderTopWidth],
  ["border-top-style", borderTopStyle],
  ["border-top-color", borderTopColor]
]);

module.exports.definition = {
  set(v) {
    this._shorthandSetter("border-top", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("border-top", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
