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
const { shorthandParser } = require("./parsers");
const { dashedToCamelCase } = require("./utils/camelize");
const getBasicPropertyDescriptor = require("./utils/getBasicPropertyDescriptor");

/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration
 */
const CSSStyleDeclaration = function CSSStyleDeclaration(onChangeCallback) {
  this._values = {};
  this._importants = {};
  this._length = 0;
  this._onChange = onChangeCallback;
  this._setInProgress = false;
};
CSSStyleDeclaration.prototype = {
  constructor: CSSStyleDeclaration,

  /**
   * @param {String} name
   */
  getPropertyPriority(name) {
    return this._importants[name] || "";
  },

  /**
   * @param {string} name
   * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-getPropertyValue
   * @return {string} the value of the property if it has been explicitly set for this declaration block.
   * Returns the empty string if the property has not been set.
   */
  getPropertyValue(name) {
    if (!Object.hasOwn(this._values, name)) {
      return "";
    }
    return this._values[name].toString();
  },

  /**
   * http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-item
   */
  item(index) {
    index = parseInt(index);
    if (index < 0 || index >= this._length) {
      return "";
    }
    return this[index];
  },

  /**
   * @param {string} name
   * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-removeProperty
   * @return {string} the value of the property if it has been explicitly set for this declaration block.
   * Returns the empty string if the property has not been set or the property name does not correspond to a known CSS property.
   */
  removeProperty(name) {
    if (!Object.hasOwn(this._values, name)) {
      return "";
    }

    const prevValue = this._values[name];
    delete this._values[name];
    delete this._importants[name];

    const index = Array.prototype.indexOf.call(this, name);
    if (index < 0) {
      return prevValue;
    }

    // That's what WebKit and Opera do
    Array.prototype.splice.call(this, index, 1);

    // That's what Firefox does
    // this[index] = ""

    if (this._onChange) {
      this._onChange(this.cssText);
    }
    return prevValue;
  },

  /**
   * @param {string} name
   * @param {string} value
   * @param {string} [priority=null] "important" or null
   * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-setProperty
   */
  setProperty(name, value, priority) {
    if (value === undefined) {
      return;
    }
    if (value === null || value === "") {
      this.removeProperty(name);
      return;
    }
    const isCustomProperty =
      name.indexOf("--") === 0 ||
      (typeof value === "string" && /^var\(--[-\w]+,?.*\)$/.test(value));
    if (isCustomProperty) {
      this._setProperty(name, value, priority);
      return;
    }
    const lowercaseName = name.toLowerCase();
    if (!allProperties.has(lowercaseName) && !allExtraProperties.has(lowercaseName)) {
      return;
    }

    this[lowercaseName] = value;
    this._importants[lowercaseName] = priority;
  },

  /* internal methods */
  _shorthandGetter(property, shorthandFor) {
    if (this._values[property] !== undefined) {
      return this.getPropertyValue(property);
    }
    return Object.keys(shorthandFor)
      .map(function (subprop) {
        return this.getPropertyValue(subprop);
      }, this)
      .filter(function (value) {
        return value !== "";
      })
      .join(" ");
  },

  _setProperty(name, value, priority) {
    if (value === undefined) {
      return;
    }
    if (value === null || value === "") {
      this.removeProperty(name);
      return;
    }
    // FIXME: remove?
    let originalText;
    if (this._onChange) {
      originalText = this.cssText;
    }
    if (this._values[name]) {
      // Property already exist. Overwrite it.
      const index = Array.prototype.indexOf.call(this, name);
      if (index < 0) {
        this[this._length] = name;
        this._length++;
      }
    } else {
      // New property.
      this[this._length] = name;
      this._length++;
    }
    this._values[name] = value;
    this._importants[name] = priority;
    if (this._onChange && this.cssText !== originalText && !this._setInProgress) {
      this._onChange(this.cssText);
    }
  },

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
      // in case subprop is an implicit property, this will clear
      // *its* subpropertiesX
      const camel = dashedToCamelCase(subprop);
      this[camel] = obj[subprop];
      // in case it gets translated into something else (0 -> 0px)
      obj[subprop] = this[camel];
      this.removeProperty(subprop);
      // don't add in empty properties
      if (obj[subprop] !== "") {
        this._values[subprop] = obj[subprop];
      }
    }, this);
    Object.keys(shorthandFor).forEach(function (subprop) {
      if (!Object.hasOwn(obj, subprop)) {
        this.removeProperty(subprop);
        delete this._values[subprop];
      }
    }, this);
    // in case the value is something like 'none' that removes all values,
    // check that the generated one is not empty, first remove the property
    // if it already exists, then call the shorthandGetter, if it's an empty
    // string, don't set the property
    this.removeProperty(property);
    const calculated = this._shorthandGetter(property, shorthandFor);
    if (calculated !== "") {
      this._setProperty(property, calculated);
    }
  },

  // isValid(){1,4} | inherit
  // if one, it applies to all
  // if two, the first applies to the top and bottom, and the second to left and right
  // if three, the first applies to the top, the second to left and right, the third bottom
  // if four, top, right, bottom, left
  _implicitSetter(propertyBefore, propertyAfter, value, isValid, parser) {
    propertyAfter ||= "";
    if (propertyAfter) {
      propertyAfter = `-${propertyAfter}`;
    }
    const partNames = ["top", "right", "bottom", "left"];
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
    let parts = [];
    if (value.toLowerCase() === "inherit" || value === "") {
      parts.push(value);
    } else {
      parts.push(...splitValue(value));
    }
    if (parts.length < 1 || parts.length > 4 || !parts.every(isValid)) {
      return;
    }
    parts = parts.map(function (part) {
      return parser(part);
    });
    this._setProperty(propertyBefore + propertyAfter, parts.join(" "));
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
      const property = `${propertyBefore}-${partNames[i]}${propertyAfter}`;
      this.removeProperty(property);
      if (parts[i] !== "") {
        this._values[property] = parts[i];
      }
    }
    return value;
  },

  //  Companion to implicitSetter, but for the individual parts.
  //  This sets the individual value, and checks to see if all four
  //  sub-parts are set.  If so, it sets the shorthand version and removes
  //  the individual parts from the cssText.
  _subImplicitSetter(prefix, part, value, isValid, parser) {
    const property = `${prefix}-${part}`;
    const subparts = [`${prefix}-top`, `${prefix}-right`, `${prefix}-bottom`, `${prefix}-left`];
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
    this._setProperty(property, value);
    const combinedPriority = this.getPropertyPriority(prefix);
    const parts = subparts.map((subpart) => this._values[subpart]);
    const priorities = subparts.map((subpart) => this.getPropertyPriority(subpart));
    // Combine into a single property if all values are set and have the same priority
    if (
      parts.every((p) => p) &&
      priorities.every((p) => p === priorities[0]) &&
      priorities[0] === combinedPriority
    ) {
      for (let i = 0; i < subparts.length; i++) {
        this.removeProperty(subparts[i]);
        this._values[subparts[i]] = parts[i];
      }
      this._setProperty(prefix, parts.join(" "), priorities[0]);
    } else {
      this.removeProperty(prefix);
      for (let j = 0; j < subparts.length; j++) {
        // The property we're setting won't be important, the rest will either keep their priority or inherit it from the combined property
        const priority = subparts[j] === property ? "" : priorities[j] || combinedPriority;
        this._setProperty(subparts[j], parts[j], priority);
      }
    }
    return value;
  },

  getPropertyCSSValue() {
    // FIXME
  },

  /**
   * element.style.overflow = "auto"
   * element.style.getPropertyShorthand("overflow-x")
   * -> "overflow"
   */
  getPropertyShorthand() {
    // FIXME
  },

  isPropertyImplicit() {
    // FIXME
  }
};

Object.defineProperties(CSSStyleDeclaration.prototype, {
  cssText: {
    get() {
      const properties = [];
      for (let i = 0; i < this._length; i++) {
        const name = this[i];
        const value = this.getPropertyValue(name);
        let priority = this.getPropertyPriority(name);
        if (priority !== "") {
          priority = ` !${priority}`;
        }
        properties.push([name, ": ", value, priority, ";"].join(""));
      }
      return properties.join(" ");
    },
    set(value) {
      this._values = {};
      Array.prototype.splice.call(this, 0, this._length);
      this._importants = {};
      let dummyRule;
      try {
        dummyRule = CSSOM.parse(`#bogus{${value}}`).cssRules[0].style;
      } catch {
        // malformed css, just return
        return;
      }
      this._setInProgress = true;
      for (let i = 0; i < dummyRule.length; ++i) {
        const name = dummyRule[i];
        this.setProperty(
          dummyRule[i],
          dummyRule.getPropertyValue(name),
          dummyRule.getPropertyPriority(name)
        );
      }
      this._setInProgress = false;
      if (this._onChange) {
        this._onChange(this.cssText);
      }
    },
    enumerable: true,
    configurable: true
  },
  parentRule: {
    get() {
      return null;
    },
    enumerable: true,
    configurable: true
  },
  length: {
    get() {
      return this._length;
    },
    // This deletes indices if the new length is less then the current
    // length. If the new length is more, it does nothing, the new indices
    // will be undefined until set.
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

require("./generated/properties")(CSSStyleDeclaration.prototype);

allProperties.forEach(function (property) {
  if (!implementedProperties.has(property)) {
    const declaration = getBasicPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
  }
});

allExtraProperties.forEach(function (property) {
  if (!implementedProperties.has(property)) {
    const declaration = getBasicPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
  }
});

exports.CSSStyleDeclaration = CSSStyleDeclaration;
