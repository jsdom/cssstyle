"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  const keywords = ["thin", "medium", "thick"];
  const key = parsers.parseKeyword(v, keywords);
  if (key) {
    return key;
  }
  return parsers.parseLength(v, true);
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("border", "");
      this._setProperty("border-width", v);
    } else {
      const positions = ["top", "right", "bottom", "left"];
      this._implicitSetter("border", "width", v, module.exports.parse, positions);
    }
  },
  get() {
    return this.getPropertyValue("border-width");
  },
  enumerable: true,
  configurable: true
};
