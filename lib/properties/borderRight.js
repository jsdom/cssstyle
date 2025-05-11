"use strict";

var borderRightWidth = require("./borderRightWidth");
var borderRightStyle = require("./borderRightStyle");
var borderRightColor = require("./borderRightColor");

var shorthandFor = new Map([
  ["border-right-width", borderRightWidth],
  ["border-right-style", borderRightStyle],
  ["border-right-color", borderRightColor]
]);

module.exports.definition = {
  set(v) {
    this._shorthandSetter("border-right", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("border-right", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
