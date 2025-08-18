/**
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 */
"use strict";
const allExtraProperties = require("./allExtraProperties");
const allProperties = require("./generated/allProperties");
const implementedProperties = require("./generated/implementedProperties");
const generatedProperties = require("./generated/properties");
const {
  hasVarFunc,
  isValidPropertyValue,
  parseCSS,
  parsePropertyValue,
  parseShorthand,
  prepareValue,
  splitValue
} = require("./parsers");
const { shorthandProperties } = require("./shorthandProperties");
const { dashedToCamelCase } = require("./utils/camelize");
const {
  borderProperties,
  normalizeBorderProperties,
  prepareBorderProperties
} = require("./utils/normalizeBorders");
const { getPropertyDescriptor } = require("./utils/propertyDescriptors");
const { asciiLowercase } = require("./utils/strings");

/**
 * @see https://drafts.csswg.org/cssom/#the-cssstyledeclaration-interface
 */
class CSSStyleDeclaration {
  /**
   * @param {Function} onChangeCallback
   * @param {object} [opt]
   * @param {object} [opt.context] - Window, Element or CSSRule.
   */
  constructor(onChangeCallback, opt = {}) {
    // Make constructor and internals non-enumerable.
    Object.defineProperties(this, {
      constructor: {
        enumerable: false,
        writable: true
      },

      // Window
      _global: {
        value: globalThis,
        enumerable: false,
        writable: true
      },

      // Element
      _ownerNode: {
        value: null,
        enumerable: false,
        writable: true
      },

      // CSSRule
      _parentNode: {
        value: null,
        enumerable: false,
        writable: true
      },

      _onChange: {
        value: null,
        enumerable: false,
        writable: true
      },

      _values: {
        value: new Map(),
        enumerable: false,
        writable: true
      },

      _priorities: {
        value: new Map(),
        enumerable: false,
        writable: true
      },

      _length: {
        value: 0,
        enumerable: false,
        writable: true
      },

      _computed: {
        value: false,
        enumerable: false,
        writable: true
      },

      _readonly: {
        value: false,
        enumerable: false,
        writable: true
      },

      _setInProgress: {
        value: false,
        enumerable: false,
        writable: true
      }
    });

    const { context } = opt;
    if (context) {
      if (typeof context.getComputedStyle === "function") {
        this._global = context;
        this._computed = true;
        this._readonly = true;
      } else if (context.nodeType === 1 && Object.hasOwn(context, "style")) {
        this._global = context.ownerDocument.defaultView;
        this._ownerNode = context;
      } else if (Object.hasOwn(context, "parentRule")) {
        this._parentRule = context;
        // Find Window from the owner node of the StyleSheet.
        const window = context?.parentStyleSheet?.ownerNode?.ownerDocument?.defaultView;
        if (window) {
          this._global = window;
        }
      }
    }
    if (typeof onChangeCallback === "function") {
      this._onChange = onChangeCallback;
    }
  }

  get cssText() {
    if (this._computed) {
      return "";
    }
    const properties = new Map();
    for (let i = 0; i < this._length; i++) {
      const property = this[i];
      const value = this.getPropertyValue(property);
      const priority = this._priorities.get(property);
      if (priority === "important") {
        properties.set(property, { property, value, priority });
      } else {
        if (shorthandProperties.has(property)) {
          const longhandProperties = shorthandProperties.get(property);
          for (const [longhand] of longhandProperties) {
            if (properties.has(longhand) && !this._priorities.get(longhand)) {
              properties.delete(longhand);
            }
          }
        }
        properties.set(property, { property, value, priority: null });
      }
    }
    const normalizedProperties = normalizeBorderProperties(properties);
    const parts = [];
    for (const { property, value, priority } of normalizedProperties.values()) {
      if (priority) {
        parts.push(`${property}: ${value} !${priority};`);
      } else {
        parts.push(`${property}: ${value};`);
      }
    }
    return parts.join(" ");
  }

  set cssText(val) {
    if (this._readonly) {
      const msg = "cssText can not be modified.";
      const name = "NoModificationAllowedError";
      throw new this._global.DOMException(msg, name);
    }
    Array.prototype.splice.call(this, 0, this._length);
    this._values.clear();
    this._priorities.clear();
    if (this._parentRule || (this._ownerNode && this._setInProgress)) {
      return;
    }
    this._setInProgress = true;
    try {
      const valueObj = parseCSS(
        val,
        {
          context: "declarationList",
          parseValue: false
        },
        true
      );
      if (valueObj?.children) {
        for (const item of valueObj.children) {
          const {
            important,
            property,
            value: { value }
          } = item;
          const priority = important ? "important" : "";
          const isCustomProperty = property.startsWith("--");
          if (isCustomProperty || hasVarFunc(value)) {
            this.setProperty(property, value, priority);
          } else {
            const parsedValue = parsePropertyValue(property, value, {
              globalObject: this._global
            });
            if (parsedValue) {
              this.setProperty(property, parsedValue, priority);
            } else {
              this.removeProperty(property);
            }
          }
        }
      }
    } catch {
      return;
    }
    this._setInProgress = false;
    if (typeof this._onChange === "function") {
      this._onChange(this.cssText);
    }
  }

  get length() {
    return this._length;
  }

  // This deletes indices if the new length is less then the current length.
  // If the new length is more, it does nothing, the new indices will be
  // undefined until set.
  set length(len) {
    for (let i = len; i < this._length; i++) {
      delete this[i];
    }
    this._length = len;
  }

  // Readonly
  get parentRule() {
    return this._parentRule;
  }

  get cssFloat() {
    return this.getPropertyValue("float");
  }

  set cssFloat(value) {
    this._setProperty("float", value);
  }

  /**
   * @param {string} property
   */
  getPropertyPriority(property) {
    return this._priorities.get(property) || "";
  }

  /**
   * @param {string} property
   */
  getPropertyValue(property) {
    if (this._values.has(property)) {
      return this._values.get(property).toString();
    }
    return "";
  }

  /**
   * @param {...number} args
   */
  item(...args) {
    if (!args.length) {
      const msg = "1 argument required, but only 0 present.";
      throw new this._global.TypeError(msg);
    }
    const [value] = args;
    const index = parseInt(value);
    if (Number.isNaN(index) || index < 0 || index >= this._length) {
      return "";
    }
    return this[index];
  }

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
    if (index >= 0) {
      Array.prototype.splice.call(this, index, 1);
      if (typeof this._onChange === "function") {
        this._onChange(this.cssText);
      }
    }
    return prevValue;
  }

  /**
   * @param {string} prop
   * @param {string} val
   * @param {string?} [priority] - "important" or null
   */
  setProperty(prop, val, priority = null) {
    if (this._readonly) {
      const msg = `Property ${prop} can not be modified.`;
      const name = "NoModificationAllowedError";
      throw new this._global.DOMException(msg, name);
    }
    const value = prepareValue(val, this._global);
    if (value === "") {
      this[prop] = "";
      this.removeProperty(prop);
      return;
    }
    const isCustomProperty = prop.startsWith("--");
    if (isCustomProperty) {
      this._setProperty(prop, value, priority);
      return;
    }
    const property = asciiLowercase(prop);
    if (!allProperties.has(property) && !allExtraProperties.has(property)) {
      return;
    }
    this[property] = value;
    if (priority) {
      this._priorities.set(property, priority);
    } else {
      this._priorities.delete(property);
    }
  }
}

// Internal methods
Object.defineProperties(CSSStyleDeclaration.prototype, {
  _shorthandGetter: {
    /**
     * @param {string} property
     * @param {object} shorthandFor
     * @param {Map} initialValues
     */
    value(property, shorthandFor, initialValues = new Map()) {
      const obj = {};
      const filter = initialValues.size > 0;
      const firstKey = filter && initialValues.keys().next().value;
      for (const key of shorthandFor.keys()) {
        const val = this.getPropertyValue(key);
        if (val === "" || hasVarFunc(val)) {
          return "";
        }
        if (filter) {
          const initialValue = initialValues.get(key);
          if (key === firstKey) {
            obj[key] = val;
          } else if (val !== initialValue) {
            obj[key] = val;
            if (obj[firstKey] && obj[firstKey] === initialValues.get(firstKey)) {
              delete obj[firstKey];
            }
          }
        } else {
          obj[key] = val;
        }
      }
      if (Object.values(obj).length) {
        const value = Object.values(obj).join(" ");
        if (isValidPropertyValue(property, value)) {
          return value;
        }
        return "";
      }
      if (this._values.has(property)) {
        return this.getPropertyValue(property);
      }
      return "";
    },
    enumerable: false
  },

  _implicitGetter: {
    /**
     * @param {string} prefix
     * @param {string} part
     * @param {Array.<string>} positions
     */
    value(prefix, part, positions = []) {
      const suffix = part ? `-${part}` : "";
      const values = [];
      for (const position of positions) {
        const val = this.getPropertyValue(`${prefix}-${position}${suffix}`);
        if (val === "" || hasVarFunc(val)) {
          return "";
        }
        values.push(val);
      }
      if (!values.length) {
        return "";
      }
      switch (positions.length) {
        case 4: {
          const [top, right, bottom, left] = values;
          if (top === right && top === bottom && right === left) {
            return top;
          }
          if (top !== right && top === bottom && right === left) {
            return `${top} ${right}`;
          }
          if (top !== right && top !== bottom && right === left) {
            return `${top} ${right} ${bottom}`;
          }
          return `${top} ${right} ${bottom} ${left}`;
        }
        case 2: {
          const [x, y] = values;
          if (x === y) {
            return x;
          }
          return `${x} ${y}`;
        }
        default:
          return "";
      }
    },
    enumerable: false
  },

  _setProperty: {
    /**
     * @param {string} property
     * @param {string} val
     * @param {string?} [priority]
     */
    value(property, val, priority = null) {
      if (typeof val !== "string") {
        return;
      }
      if (val === "") {
        this.removeProperty(property);
        return;
      }
      let originalText = "";
      if (typeof this._onChange === "function") {
        originalText = this.cssText;
      }
      if (this._values.has(property)) {
        const index = Array.prototype.indexOf.call(this, property);
        // The property already exists but is not indexed into `this` so add it.
        if (index < 0) {
          this[this._length] = property;
          this._length++;
        }
      } else {
        // New property.
        this[this._length] = property;
        this._length++;
      }
      this._values.set(property, val);
      if (priority) {
        this._priorities.set(property, priority);
      } else {
        this._priorities.delete(property);
      }
      if (
        typeof this._onChange === "function" &&
        this.cssText !== originalText &&
        !this._setInProgress
      ) {
        this._onChange(this.cssText);
      }
    },
    enumerable: false
  },

  _shorthandSetter: {
    /**
     * @param {string} property
     * @param {string} val
     * @param {object} shorthandFor
     */
    value(property, val, shorthandFor) {
      const obj = parseShorthand(val, shorthandFor, {
        globalObject: this._global
      });
      if (!obj) {
        return;
      }
      for (const subprop of Object.keys(obj)) {
        // In case subprop is an implicit property, this will clear *its*
        // subpropertiesX.
        const camel = dashedToCamelCase(subprop);
        this[camel] = obj[subprop];
        // In case it gets translated into something else (0 -> 0px).
        obj[subprop] = this[camel];
        this.removeProperty(subprop);
        // Don't add in empty properties.
        if (obj[subprop] !== "") {
          this._values.set(subprop, obj[subprop]);
        }
      }
      for (const [subprop] of shorthandFor) {
        if (!Object.hasOwn(obj, subprop)) {
          this.removeProperty(subprop);
          this._values.delete(subprop);
        }
      }
      // In case the value is something like 'none' that removes all values,
      // check that the generated one is not empty, first remove the property,
      // if it already exists, then call the shorthandGetter, if it's an empty
      // string, don't set the property.
      this.removeProperty(property);
      const calculated = this._shorthandGetter(property, shorthandFor);
      if (calculated !== "") {
        this._setProperty(property, calculated);
      }
      return obj;
    },
    enumerable: false
  },

  _implicitSetter: {
    /**
     * @param {string} prefix
     * @param {string} part
     * @param {string|Array.<string>} val
     * @param {Function} parser
     * @param {Array.<string>} positions
     */
    value(prefix, part, val, parser, positions = []) {
      const suffix = part ? `-${part}` : "";
      const values = [];
      if (val === "") {
        values.push(val);
      } else if (Array.isArray(val) && val.length) {
        values.push(...val);
      } else {
        const parsedValue = parser(val, {
          globalObject: this._global
        });
        if (typeof parsedValue !== "string") {
          return;
        }
        values.push(...splitValue(parsedValue));
      }
      if (!values.length || values.length > positions.length) {
        return;
      }
      const shorthandProp = `${prefix}${suffix}`;
      const shorthandVal = values.join(" ");
      const positionValues = [...values];
      switch (positions.length) {
        case 4: {
          if (values.length === 1) {
            positionValues.push(values[0], values[0], values[0]);
          } else if (values.length === 2) {
            positionValues.push(values[0], values[1]);
          } else if (values.length === 3) {
            positionValues.push(values[1]);
          }
          break;
        }
        case 2: {
          if (values.length === 1) {
            positionValues.push(values[0]);
          }
          break;
        }
        default:
      }
      const longhandValues = [];
      for (const position of positions) {
        const property = `${prefix}-${position}${suffix}`;
        const longhandValue = this.getPropertyValue(property);
        const longhandPriority = this._priorities.get(property);
        longhandValues.push([longhandValue, longhandPriority]);
      }
      for (let i = 0; i < positions.length; i++) {
        const property = `${prefix}-${positions[i]}${suffix}`;
        const [longhandValue, longhandPriority] = longhandValues[i];
        const longhandVal = longhandPriority ? longhandValue : positionValues[i];
        this.removeProperty(property);
        this._values.set(property, longhandVal);
      }
      this._setProperty(shorthandProp, shorthandVal);
    },
    enumerable: false
  },

  // Companion to implicitSetter, but for the individual parts.
  // This sets the individual value, and checks to see if all sub-parts are
  // set. If so, it sets the shorthand version and removes the individual parts
  // from the cssText.
  _subImplicitSetter: {
    /**
     * @param {string} prefix
     * @param {string} part
     * @param {string} val
     * @param {Function} parser
     * @param {Array.<string>} positions
     */
    value(prefix, part, val, parser, positions = []) {
      const parsedValue = parser(val, {
        globalObject: this._global
      });
      if (typeof parsedValue !== "string") {
        return;
      }
      const property = `${prefix}-${part}`;
      this._setProperty(property, parsedValue);
      const combinedPriority = this._priorities.get(prefix);
      const subparts = [];
      for (const position of positions) {
        subparts.push(`${prefix}-${position}`);
      }
      const parts = subparts.map((subpart) => this._values.get(subpart));
      const priorities = subparts.map((subpart) => this._priorities.get(subpart));
      const [priority] = priorities;
      // Combine into a single property if all values are set and have the same
      // priority.
      if (
        priority === combinedPriority &&
        parts.every((p) => p) &&
        priorities.every((p) => p === priority)
      ) {
        for (let i = 0; i < subparts.length; i++) {
          this.removeProperty(subparts[i]);
          this._values.set(subparts[i], parts[i]);
        }
        this._setProperty(prefix, parts.join(" "), priority);
      } else {
        this.removeProperty(prefix);
        for (let i = 0; i < subparts.length; i++) {
          // The property we're setting won't be important, the rest will either
          // keep their priority or inherit it from the combined property
          const subPriority = subparts[i] === property ? "" : priorities[i] || combinedPriority;
          this._setProperty(subparts[i], parts[i], subPriority);
        }
      }
    },
    enumerable: false
  },

  _implicitBorderSetter: {
    /**
     * @param {string} prop
     * @param {string} val
     */
    value(prop, val) {
      const properties = new Map();
      if (prop !== "border") {
        for (let i = 0; i < this._length; i++) {
          const property = this[i];
          if (borderProperties.has(property)) {
            const value = this.getPropertyValue(property);
            properties.set(property, { property, value, priority: null });
          }
        }
      }
      const parsedProperties = prepareBorderProperties(prop, val, properties, {
        globalObject: this._global
      });
      for (const [property, item] of parsedProperties) {
        const { value } = item;
        this._setProperty(property, value);
      }
    },
    enumerable: false
  }
});

// Properties
Object.defineProperties(CSSStyleDeclaration.prototype, generatedProperties);

// Additional properties
[...allProperties, ...allExtraProperties].forEach(function (property) {
  if (!implementedProperties.has(property)) {
    const declaration = getPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    const camel = dashedToCamelCase(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, camel, declaration);
    if (/^webkit[A-Z]/.test(camel)) {
      const pascal = camel.replace(/^webkit/, "Webkit");
      Object.defineProperty(CSSStyleDeclaration.prototype, pascal, declaration);
    }
  }
});

exports.CSSStyleDeclaration = CSSStyleDeclaration;
