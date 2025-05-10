"use strict";

module.exports.isValid = function (v) {
  var validStyles = ["normal", "italic", "oblique", "inherit"];
  return validStyles.indexOf(v.toLowerCase()) !== -1;
};

module.exports.definition = {
  set(v) {
    this._setProperty("font-style", v);
  },
  get() {
    return this.getPropertyValue("font-style");
  },
  enumerable: true,
  configurable: true
};
