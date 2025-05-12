/**
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 */
"use strict";
const { splitValue } = require("@asamuzakjp/css-color").utils;
const CSSOM = require("rrweb-cssom");
const allExtraProperties = require("./allExtraProperties");
const allProperties = require("./generated/allProperties");
const implementedProperties = require("./generated/implementedProperties");
const generatedProperties = require("./generated/properties");
const { shorthandParser } = require("./parsers");
const { dashedToCamelCase } = require("./utils/camelize");
const getPropertyDescriptor = require("./utils/getBasicPropertyDescriptor");

/**
 * @constructor
 * @see https://drafts.csswg.org/cssom/#the-cssstyledeclaration-interface
 * @param {object} context - Window, Element, CSSRule.
 */
const CSSStyleDeclaration = function CSSStyleDeclaration(context) {
  this._global = globalThis;
  this._ownerNode = null;
  this._parentRule = null;
  this._values = new Map();
  this._priorities = new Map();
  this._length = 0;
  this._readonly = false;
  this._computed = false;
  this._setInProgress = false;
  if (context) {
    if (typeof context.getComputedStyle === "function") {
      // Window
      this._global = context;
      this._computed = true;
      this._readonly = true;
    } else if (context.nodeType === 1 && context.style) {
      // Element
      this._ownerNode = context;
    } else if (context.parentRule) {
      // CSSRule
      this._parentRule = context.parentRule;
    }
  }
};

CSSStyleDeclaration.prototype = {
  constructor: CSSStyleDeclaration,

  /**
   * @param {String} property
   */
  getPropertyPriority(property) {
    return this._priorities.get(property) || "";
  },

  /**
   * @param {string} property
   */
  getPropertyValue(property) {
    if (this._values.has(property)) {
      return this._values.get(property).toString();
    }
    return "";
  },

  /**
   * @param {number} args
   */
  item(...args) {
    if (!args.length) {
      const msg = "1 argument required, but only 0 present.";
      throw new this._global.TypeError(msg);
    }
    let [index] = args;
    index = parseInt(index);
    if (Number.isNaN(index) || index < 0 || index >= this._length) {
      return "";
    }
    return this[index];
  },

  /**
   * @param {string} property
   */
  removeProperty(property) {
    if (this._readonly) {
      const msg = `Property ${property} can not be modified.`;
      const name = "NoModificationAllowedError";
      throw new this._global.DOMException(msg, name);
    }
    if (!this._values.has(property)) {
      return "";
    }
    const prevValue = this._values.get(property);
    this._values.delete(property);
    this._priorities.delete(property);
    const index = Array.prototype.indexOf.call(this, property);
    if (index < 0) {
      return prevValue;
    }
    Array.prototype.splice.call(this, index, 1);
    return prevValue;
  },

  /**
   * @param {string} property
   * @param {string} value
   * @param {string?} [priority] - "important" or null
   */
  setProperty(property, value, priority = null) {
    if (this._readonly) {
      const msg = `Property ${property} can not be modified.`;
      const name = "NoModificationAllowedError";
      throw new this._global.DOMException(msg, name);
    }
    if (value === undefined) {
      return;
    }
    if (value === null || value === "") {
      this.removeProperty(property);
      return;
    }
    const isCustomProperty = property.startsWith("--");
    if (isCustomProperty) {
      this._setProperty(property, value, priority);
      return;
    }
    property = property.toLowerCase();
    if (!allProperties.has(property) && !allExtraProperties.has(property)) {
      return;
    }
    this[property] = value;
    if (priority) {
      this._priorities.set(property, priority);
    } else {
      this._priorities.delete(property);
    }
  },

  /* internal methods */
  /**
   * @param {string} property
   * @param {object} shorthandFor
   */
  _shorthandGetter(property, shorthandFor) {
    if (this._values.has(property)) {
      return this.getPropertyValue(property);
    }
    return [...shorthandFor.keys()]
      .map(function (subprop) {
        return this.getPropertyValue(subprop);
      }, this)
      .filter(function (value) {
        return value !== "";
      })
      .join(" ");
  },

  /**
   * @param {string} property
   * @param {string} value
   * @param {string?} [priority]
   */
  _setProperty(property, value, priority = null) {
    if (value === undefined) {
      return;
    }
    if (value === null || value === "") {
      this.removeProperty(property);
      return;
    }
    if (this._values.has(property)) {
      // Property already exist. Overwrite it.
      const index = Array.prototype.indexOf.call(this, property);
      if (index < 0) {
        this[this._length] = property;
        this._length++;
      }
    } else {
      // New property.
      this[this._length] = property;
      this._length++;
    }
    this._values.set(property, value);
    if (priority) {
      this._priorities.set(property, priority);
    } else {
      this._priorities.delete(property);
    }
  },

  /**
   * @param {string} property
   * @param {string} value
   * @param {object} shorthandFor
   */
  _shorthandSetter(property, value, shorthandFor) {
    if (value === undefined) {
      return;
    }
    if (value === null) {
      value = "";
    }
    const obj = shorthandParser(value, shorthandFor);
    if (obj === undefined) {
      return;
    }
    Object.keys(obj).forEach(function (subprop) {
      // in case subprop is an implicit property, this will clear *its*
      // subpropertiesX
      const camel = dashedToCamelCase(subprop);
      this[camel] = obj[subprop];
      // in case it gets translated into something else (0 -> 0px)
      obj[subprop] = this[camel];
      this.removeProperty(subprop);
      // don't add in empty properties
      if (obj[subprop] !== "") {
        this._values.set(subprop, obj[subprop]);
      }
    }, this);
    shorthandFor.forEach(function (subval, subprop) {
      if (!Object.hasOwn(obj, subprop)) {
        this.removeProperty(subprop);
        this._values.delete(subprop);
      }
    }, this);
    // in case the value is something like 'none' that removes all values,
    // check that the generated one is not empty, first remove the property,
    // if it already exists, then call the shorthandGetter, if it's an empty
    // string, don't set the property
    this.removeProperty(property);
    const calculated = this._shorthandGetter(property, shorthandFor);
    if (calculated !== "") {
      this._setProperty(property, calculated);
    }
    return obj;
  },

  // Companion to shorthandSetter, but for the individual parts which takes
  // position value in the middle.
  /**
   * @param {string} property
   * @param {string} value
   * @param {object} shorthandFor
   */
  _midShorthandSetter(property, value, shorthandFor) {
    if (value === undefined) {
      return;
    }
    if (value === null) {
      value = "";
    }
    if (typeof value === "number") {
      value = value.toString();
    }
    if (typeof value !== "string") {
      return;
    }
    const obj = this._shorthandSetter(property, value, shorthandFor);
    if (!obj) {
      return;
    }
    this.removeProperty(`${property}-top`);
    this.removeProperty(`${property}-right`);
    this.removeProperty(`${property}-bottom`);
    this.removeProperty(`${property}-left`);
    this._values.set(`${property}-top`, value);
    this._values.set(`${property}-right`, value);
    this._values.set(`${property}-bottom`, value);
    this._values.set(`${property}-left`, value);
    return value;
  },

  // isValid(){1,4} | inherit
  // If one, it applies to all.
  // If two, the first applies to the top and bottom, and the second to left
  // and right.
  // If three, the first applies to the top, the second to left and right,
  // the third bottom.
  // If four, top, right, bottom, left.
  /**
   * @param {string} prefix
   * @param {string} part
   * @param {string} value
   * @param {Function} isValid
   * @param {Function} parser
   */
  _implicitSetter(prefix, part, value, isValid, parser) {
    if (value === undefined) {
      return;
    }
    if (value === null) {
      value = "";
    }
    if (typeof value === "number") {
      value = value.toString();
    }
    if (typeof value !== "string") {
      return;
    }
    part ||= "";
    if (part) {
      part = `-${part}`;
    }
    const partNames = ["top", "right", "bottom", "left"];
    let parts = [];
    if (value.toLowerCase() === "inherit" || value === "") {
      parts.push(value);
    } else {
      parts.push(...splitValue(value));
    }
    if (parts.length < 1 || parts.length > 4 || !parts.every(isValid)) {
      return;
    }
    parts = parts.map((p) => parser(p));
    this._setProperty(prefix + part, parts.join(" "));
    if (parts.length === 1) {
      parts[1] = parts[0];
    }
    if (parts.length === 2) {
      parts[2] = parts[0];
    }
    if (parts.length === 3) {
      parts[3] = parts[1];
    }
    for (let i = 0; i < 4; i++) {
      const property = `${prefix}-${partNames[i]}${part}`;
      this.removeProperty(property);
      if (parts[i] !== "") {
        this._values.set(property, parts[i]);
      }
    }
    return value;
  },

  // Companion to implicitSetter, but for the individual parts.
  // This sets the individual value, and checks to see if all four sub-parts
  // are set.  If so, it sets the shorthand version and removes the individual
  // parts from the cssText.
  /**
   * @param {string} prefix
   * @param {string} part
   * @param {string} value
   * @param {Function} isValid
   * @param {Function} parser
   */
  _subImplicitSetter(prefix, part, value, isValid, parser) {
    if (value === undefined) {
      return;
    }
    if (value === null) {
      value = "";
    }
    if (typeof value === "number") {
      value = value.toString();
    }
    if (typeof value !== "string") {
      return;
    }
    if (!isValid(value)) {
      return;
    }
    value = parser(value);
    const property = `${prefix}-${part}`;
    this._setProperty(property, value);
    const combinedPriority = this.getPropertyPriority(prefix);
    const subparts = [`${prefix}-top`, `${prefix}-right`, `${prefix}-bottom`, `${prefix}-left`];
    const parts = subparts.map((subpart) => this._values.get(subpart));
    const priorities = subparts.map((subpart) => this.getPropertyPriority(subpart));
    // Combine into a single property if all values are set and have the same priority
    if (
      parts.every((p) => p) &&
      priorities.every((p) => p === priorities[0]) &&
      priorities[0] === combinedPriority
    ) {
      for (let i = 0; i < subparts.length; i++) {
        this.removeProperty(subparts[i]);
        this._values.set(subparts[i], parts[i]);
      }
      this._setProperty(prefix, parts.join(" "), priorities[0]);
    } else {
      this.removeProperty(prefix);
      for (let i = 0; i < subparts.length; i++) {
        // The property we're setting won't be important, the rest will either
        // keep their priority or inherit it from the combined property
        const priority = subparts[i] === property ? "" : priorities[i] || combinedPriority;
        this._setProperty(subparts[i], parts[i], priority);
      }
    }
    return value;
  }
};

Object.defineProperties(CSSStyleDeclaration.prototype, {
  cssText: {
    get() {
      if (this._computed) {
        return "";
      }
      const properties = [];
      for (let i = 0; i < this._length; i++) {
        const property = this[i];
        const value = this.getPropertyValue(property);
        let priority = this.getPropertyPriority(property);
        if (priority !== "") {
          priority = ` !${priority}`;
        }
        properties.push([property, ": ", value, priority, ";"].join(""));
      }
      return properties.join(" ");
    },
    set(value) {
      if (this._readonly) {
        const msg = "cssText can not be modified.";
        const name = "NoModificationAllowedError";
        throw new this._global.DOMException(msg, name);
      }
      Array.prototype.splice.call(this, 0, this._length);
      this._values.clear();
      this._priorities.clear();
      let dummyRule;
      try {
        dummyRule = CSSOM.parse(`#bogus{${value}}`).cssRules[0].style;
      } catch {
        // malformed css, just return
        return;
      }
      if (this._setInProgress) {
        return;
      }
      this._setInProgress = true;
      for (let i = 0; i < dummyRule.length; i++) {
        const property = dummyRule[i];
        this.setProperty(
          property,
          dummyRule.getPropertyValue(property),
          dummyRule.getPropertyPriority(property)
        );
      }
      this._setInProgress = false;
    },
    enumerable: true,
    configurable: true
  },

  parentRule: {
    get() {
      return this._parentRule;
    },
    enumerable: true,
    configurable: true
  },

  length: {
    get() {
      return this._length;
    },
    // This deletes indices if the new length is less then the current length.
    // If the new length is more, it does nothing, the new indices will be
    // undefined until set.
    set(value) {
      for (let i = value; i < this._length; i++) {
        delete this[i];
      }
      this._length = value;
    },
    enumerable: true,
    configurable: true
  }
});

Object.defineProperties(CSSStyleDeclaration.prototype, generatedProperties);

allProperties.forEach(function (property) {
  if (!implementedProperties.has(property)) {
    const declaration = getPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
  }
});

allExtraProperties.forEach(function (property) {
  if (!implementedProperties.has(property)) {
    const declaration = getPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
  }
});

exports.CSSStyleDeclaration = CSSStyleDeclaration;
