"use strict";

var shorthandFor = {
  "border-bottom-width": require("./borderBottomWidth"),
  "border-bottom-style": require("./borderBottomStyle"),
  "border-bottom-color": require("./borderBottomColor")
};

module.exports.definition = {
  set(v) {
    this._shorthandSetter("border-bottom", v, shorthandFor);
  },
  get() {
    return this._shorthandGetter("border-bottom", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
