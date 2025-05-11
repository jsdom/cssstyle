"use strict";

var shorthandFor = {
  "border-right-width": require("./borderRightWidth"),
  "border-right-style": require("./borderRightStyle"),
  "border-right-color": require("./borderRightColor")
};

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
