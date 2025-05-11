"use strict";

var shorthandFor = {
  "border-top-width": require("./borderTopWidth"),
  "border-top-style": require("./borderTopStyle"),
  "border-top-color": require("./borderTopColor")
};

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
