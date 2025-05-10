"use strict";

var parseKeyword = require("../parsers").parseKeyword;

module.exports.definition = {
  set: function (v) {
    var clearKeywords = ["none", "left", "right", "both", "inherit"];
    this._setProperty("clear", parseKeyword(v, clearKeywords));
  },
  get: function () {
    return this.getPropertyValue("clear");
  },
  enumerable: true,
  configurable: true
};
