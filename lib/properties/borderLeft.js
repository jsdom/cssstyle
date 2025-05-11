"use strict";

var shorthandFor = {
  "border-left-width": require("./borderLeftWidth"),
  "border-left-style": require("./borderLeftStyle"),
  "border-left-color": require("./borderLeftColor")
};

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
