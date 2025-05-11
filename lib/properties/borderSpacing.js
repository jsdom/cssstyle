"use strict";

var parsers = require("../parsers");

module.exports.definition = {
  set(v) {
    if (v === undefined) {
      return;
    }
    if (v === null) {
      v = "";
    }
    // <length> <length>? | inherit
    // if one, it applies to both horizontal and verical spacing
    // if two, the first applies to the horizontal and the second applies to
    // vertical spacing
    var parse = function parse(val) {
      if (val === "") {
        return;
      }
      if (val === 0) {
        return "0px";
      }
      if (val.toLowerCase() === "inherit") {
        return val.toLowerCase();
      }
      var parts = val.split(/\s+/);
      if (parts.length !== 1 && parts.length !== 2) {
        return;
      }
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (parsers.valueType(part) !== parsers.TYPES.LENGTH) {
          return;
        }
      }
      return val;
    };
    this._setProperty("border-spacing", parse(v));
  },
  get() {
    return this.getPropertyValue("border-spacing");
  },
  enumerable: true,
  configurable: true
};
