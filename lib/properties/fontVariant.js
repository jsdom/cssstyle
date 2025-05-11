"use strict";

module.exports.isValid = function isValid(v) {
  var validVariants = ["normal", "small-caps", "inherit"];
  return validVariants.indexOf(v.toLowerCase()) !== -1;
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("font-variant", v);
  },
  get() {
    return this.getPropertyValue("font-variant");
  },
  enumerable: true,
  configurable: true
};
