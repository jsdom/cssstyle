"use strict";

var shorthandFor = {
  "border-width": require("./borderWidth"),
  "border-style": require("./borderStyle"),
  "border-color": require("./borderColor")
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (v.toString().toLowerCase() === "none") {
      v = "";
    }
    this._shorthandSetter("border", v, shorthandFor);
    this.removeProperty("border-top");
    this.removeProperty("border-left");
    this.removeProperty("border-right");
    this.removeProperty("border-bottom");
    this._values["border-top"] = this._values.border;
    this._values["border-left"] = this._values.border;
    this._values["border-right"] = this._values.border;
    this._values["border-bottom"] = this._values.border;
  },
  get() {
    return this._shorthandGetter("border", shorthandFor);
  },
  enumerable: true,
  configurable: true
};
