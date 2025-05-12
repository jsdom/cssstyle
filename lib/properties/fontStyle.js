"use strict";

module.exports.isValid = function (v) {
  const validStyles = ["normal", "italic", "oblique", "inherit"];
  return validStyles.indexOf(v.toLowerCase()) !== -1;
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
      this._setProperty("font-style", v);
    }
  },
  get() {
    return this.getPropertyValue("font-style");
  },
  enumerable: true,
  configurable: true
};
