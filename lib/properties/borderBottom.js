"use strict";

const parsers = require("../parsers");
const borderBottomWidth = require("./borderBottomWidth");
const borderBottomStyle = require("./borderBottomStyle");
const borderBottomColor = require("./borderBottomColor");

module.exports.shorthandFor = new Map([
  ["border-bottom-width", borderBottomWidth],
  ["border-bottom-style", borderBottomStyle],
  ["border-bottom-color", borderBottomColor]
]);

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      for (const [key] of module.exports.shorthandFor) {
        this._setProperty(key, "");
      }
      this._setProperty("border", "");
      this._setProperty("border-bottom", v);
    } else {
      this._shorthandSetter("border-bottom", v, module.exports.shorthandFor);
    }
  },
  get() {
    let val = this.getPropertyValue("border-bottom");
    if (parsers.hasVarFunc(val)) {
      return val;
    }
    val = this._shorthandGetter("border-bottom", module.exports.shorthandFor);
    if (parsers.hasVarFunc(val)) {
      return "";
    }
    return val;
  },
  enumerable: true,
  configurable: true
};
