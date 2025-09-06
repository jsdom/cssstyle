"use strict";

const parsers = require("../parsers");

const property = "-webkit-border-start-color";

module.exports.parse = function parse(v, opt = {}) {
  if (v === "") {
    return v;
  }
  const { globalObject, options } = opt;
  const value = parsers.parsePropertyValue(property, v, {
    globalObject,
    options,
    inArray: true
  });
  if (Array.isArray(value) && value.length === 1) {
    const [{ name, type }] = value;
    switch (type) {
      case "GlobalKeyword": {
        return name;
      }
      default: {
        return parsers.parseColor(value, options);
      }
    }
  } else if (typeof value === "string") {
    return value;
  }
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty(property, v);
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (typeof val === "string") {
        const priority = this._priorities.get(property) ?? "";
        this._setProperty(property, val, priority);
      }
    }
  },
  get() {
    return this.getPropertyValue(property);
  },
  enumerable: true,
  configurable: true
};
