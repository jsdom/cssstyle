"use strict";

module.exports.isValid = function isValid(v) {
  const validWeights = [
    "normal",
    "bold",
    "bolder",
    "lighter",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "inherit"
  ];
  return validWeights.indexOf(v.toLowerCase()) !== -1;
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    if (module.exports.isValid(v)) {
      this._setProperty("font-weight", v);
    }
  },
  get() {
    return this.getPropertyValue("font-weight");
  },
  enumerable: true,
  configurable: true
};
