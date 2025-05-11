"use strict";

var borderTopWidth = require("./borderTopWidth");
var borderTopStyle = require("./borderTopStyle");
var borderTopColor = require("./borderTopColor");

var shorthandFor = new Map([
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
