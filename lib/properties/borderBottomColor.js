"use strict";

const parsers = require("../parsers");

const property = "border-bottom-color";
const lineShorthand = "border-color";
const positionShorthand = "border-bottom";
const shorthand = "border";

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
    // The value has already been set.
    if (this._values.get(property) === v && !this._priorities.get(property)) {
      return;
    }
    if (parsers.hasVarFunc(v)) {
      this._borderSetter(property, v, "");
    } else {
      const val = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (typeof val === "string") {
        const shorthandPriority = this._priorities.get(shorthand);
        const linePriority = this._priorities.get(lineShorthand);
        const positionPriority = this._priorities.get(positionShorthand);
        let priority = this._priorities.get(property) ?? "";
        if ((shorthandPriority || linePriority || positionPriority) && priority) {
          priority = "";
        }
        this._borderSetter(property, val, priority);
      }
    }
  },
  get() {
    return this.getPropertyValue(property);
  },
  enumerable: true,
  configurable: true
};
