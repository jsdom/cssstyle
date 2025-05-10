"use strict";

var parseKeyword = require("../parsers").parseKeyword;

module.exports.definition = {
  set(v) {
    var clearKeywords = ["none", "left", "right", "both", "inherit"];
    this._setProperty("clear", parseKeyword(v, clearKeywords));
  },
  get() {
    return this.getPropertyValue("clear");
  },
  enumerable: true,
  configurable: true
};
