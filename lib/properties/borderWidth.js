"use strict";

var parsers = require("../parsers");

module.exports.isValid = function isValid(v) {
  var length = parsers.parseLength(v);
  if (length !== undefined) {
    return true;
  }
  if (typeof v !== "string") {
    return false;
  }
  if (v === "") {
    return true;
  }
  v = v.toLowerCase();
  // the valid border-widths:
  var widths = ["thin", "medium", "thick"];
  if (widths.indexOf(v) === -1) {
    return false;
  }
  return true;
};

module.exports.definition = {
  set(v) {
    var parser = function (val) {
      var length = parsers.parseLength(val);
      if (length !== undefined) {
        return length;
      }
      if (module.exports.isValid(val)) {
        return val.toLowerCase();
      }
    };
    this._implicitSetter("border", "width", v, module.exports.isValid, parser);
  },
  get() {
    return this.getPropertyValue("border-width");
  },
  enumerable: true,
  configurable: true
};
