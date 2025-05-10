/**
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 */
"use strict";
const CSSOM = require("rrweb-cssom");
const allExtraProperties = require("./allExtraProperties");
const allProperties = require("./generated/allProperties");
const implementedProperties = require("./generated/implementedProperties");
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

  _setProperty(name, value, priority) {
    if (value === undefined) {
      return;
    }
    if (value === null || value === "") {
      this.removeProperty(name);
      return;
    }

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
   * @param {String} name
   */
  getPropertyPriority(name) {
    return this._importants[name] || "";
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
