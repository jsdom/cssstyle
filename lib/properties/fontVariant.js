"use strict";

module.exports.isValid = function isValid(v) {
  const validVariants = ["normal", "small-caps", "inherit"];
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
    if (module.exports.isValid(v)) {
      this._setProperty("font-variant", v);
    }
  },
  get() {
    return this.getPropertyValue("font-variant");
  },
  enumerable: true,
  configurable: true
};
