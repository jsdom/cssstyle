"use strict";

module.exports.isValid = function isValid(v) {
  // the valid border-styles:
  var styles = [
    "none",
    "hidden",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset"
  ];
  return typeof v === "string" && (v === "" || styles.indexOf(v) !== -1);
};

module.exports.definition = {
  set(v) {
    var parser = function (val) {
      if (module.exports.isValid(val)) {
        return val.toLowerCase();
      }
    };
    this._implicitSetter("border", "style", v, module.exports.isValid, parser);
  },
  get() {
    return this.getPropertyValue("border-style");
  },
  enumerable: true,
  configurable: true
};
