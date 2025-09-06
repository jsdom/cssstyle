"use strict";

const parsers = require("../parsers");

exports.getPropertyDescriptor = function getPropertyDescriptor(property) {
  return {
    set(v) {
      const val = parsers.parsePropertyValue(property, v, {
        globalObject: this._global,
        options: this._options
      });
      if (typeof val === "string") {
        const priority = this._priorities.get(property) ?? "";
        this._setProperty(property, val, priority);
      }
    },
    get() {
      return this.getPropertyValue(property);
    },
    enumerable: true,
    configurable: true
  };
};
