"use strict";

var TYPES = require("../parsers").TYPES;
var valueType = require("../parsers").valueType;

var partsRegEx = /\s*,\s*/;
module.exports.isValid = function isValid(v) {
  if (v === "" || v === null) {
    return true;
  }
  var parts = v.split(partsRegEx);
  for (var i = 0; i < parts.length; i++) {
    var type = valueType(parts[i]);
    if (type === TYPES.STRING || type === TYPES.KEYWORD) {
      return true;
    }
  }
  return false;
};

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    this._setProperty("font-family", v);
  },
  get() {
    return this.getPropertyValue("font-family");
  },
  enumerable: true,
  configurable: true
};
