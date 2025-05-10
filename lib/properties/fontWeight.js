"use strict";

module.exports.isValid = function isValid(v) {
  var validWeights = [
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
  set: function (v) {
    this._setProperty("font-weight", v);
  },
  get: function () {
    return this.getPropertyValue("font-weight");
  },
  enumerable: true,
  configurable: true
};
