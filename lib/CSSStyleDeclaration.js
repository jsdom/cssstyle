/**
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 */
"use strict";

const generatedProperties = require("./generated/properties");
const propertyDefinitions = require("./generated/propertyDefinitions");
const {
  borderProperties,
  getPositionValue,
  normalizeProperties,
  prepareBorderProperties,
  prepareProperties,
  shorthandProperties
} = require("./normalize");
const {
  hasVarFunc,
  isGlobalKeyword,
  parseCSS,
  parsePropertyValue,
  prepareValue
} = require("./parsers");
const { getPropertyDescriptor } = require("./utils/propertyDescriptors");
const { asciiLowercase } = require("./utils/strings");

const ELEMENT_NODE = 1;

/**
 * @see https://drafts.csswg.org/cssom/#the-cssstyledeclaration-interface
 */
class CSSStyleDeclaration {
  /**
   * @param {object} globalObject - Window
   * @param {object} opt - Options
   * @param {object} opt.context - Element or CSSStyleRule
   * @param {string} opt.format - "specifiedValue" or "computedValue"
   * @param {Function} opt.onChange - Callback when cssText is changed or the property is removed
   */
  constructor(globalObject, opt = {}) {
    const { context, format, onChange } = opt;

    // These help interface with jsdom.
    this._global = globalObject;
    this._onChange = onChange;

    // These correspond to https://drafts.csswg.org/cssom/#css-declaration-block.
    this._computed = format === "computedValue";
    this._ownerNode = null;
    this._parentRule = null;
    if (context) {
      // The context is an element.
      if (context.nodeType === ELEMENT_NODE) {
        this._ownerNode = context;
        // The context is a CSSStyleRule.
      } else if (Object.hasOwn(context, "parentRule")) {
        this._parentRule = context;
      }
    }
    this._readonly = false;
    this._updating = false;

    // These correspond to the specification's "declarations".
    this._values = new Map();
    this._priorities = new Map();
    this._length = 0;

    // This is used internally by parsers. e.g. parsers.resolveCalc(), parsers.parseColor(), etc.
    this._options = {
      format: format === "computedValue" ? format : "specifiedValue"
    };
  }

  get cssText() {
    if (this._computed) {
      return "";
    }
    const properties = new Map();
    for (let i = 0; i < this._length; i++) {
      const property = this[i];
      const value = this.getPropertyValue(property);
      const priority = this._priorities.get(property) ?? "";
      if (shorthandProperties.has(property)) {
        const { shorthandFor } = shorthandProperties.get(property);
        for (const [longhand] of shorthandFor) {
          if (priority || !this._priorities.get(longhand)) {
            properties.delete(longhand);
          }
        }
      }
      properties.set(property, { property, value, priority });
    }
    const normalizedProperties = normalizeProperties(properties);
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
    if (this._updating) {
      return;
    }
    Array.prototype.splice.call(this, 0, this._length);
    this._values.clear();
    this._priorities.clear();
    this._updating = true;
    try {
      // TBD: use cache?
      const valueObj = parseCSS(
        val,
        {
          globalObject: this._global,
          options: {
            context: "declarationList",
            parseValue: false
          }
        },
        true
      );
      if (valueObj?.children) {
        const properties = new Map();
        let shouldSkipNext = false;
        for (const item of valueObj.children) {
          if (item.type === "Atrule") {
            continue;
          }
          if (item.type === "Rule") {
            shouldSkipNext = true;
            continue;
          }
          if (shouldSkipNext === true) {
            shouldSkipNext = false;
            continue;
          }
          if (item.type === "Declaration") {
            const {
              important,
              property,
              value: { value }
            } = item;
            const priority = important ? "important" : "";
            const isCustomProperty = property.startsWith("--");
            if (isCustomProperty || hasVarFunc(value)) {
              if (properties.has(property)) {
                const { priority: itemPriority } = properties.get(property);
                if (!itemPriority) {
                  properties.set(property, { property, value, priority });
                }
              } else {
                properties.set(property, { property, value, priority });
              }
            } else {
              // TBD: use cache?
              const parsedValue = parsePropertyValue(property, value, {
                globalObject: this._global,
                options: this._options
              });
              if (parsedValue) {
                if (properties.has(property)) {
                  const { priority: itemPriority } = properties.get(property);
                  if (!itemPriority) {
                    properties.set(property, { property, value, priority });
                  }
                } else {
                  properties.set(property, { property, value, priority });
                }
              } else {
                this.removeProperty(property);
              }
            }
          }
        }
        const parsedProperties = prepareProperties(properties, {
          globalObject: this._global,
          options: this._options
        });
        for (const [property, item] of parsedProperties) {
          const { priority, value } = item;
          this._priorities.set(property, priority);
          this.setProperty(property, value, priority);
        }
      }
    } catch {
      return;
    }
    this._updating = false;
    if (typeof this._onChange === "function") {
      this._onChange(this.cssText);
    }
  }

  get length() {
    return this._length;
  }

  // This deletes indices if the new length is less then the current length.
  // If the new length is more, it does nothing, the new indices will be undefined until set.
  set length(len) {
    for (let i = len; i < this._length; i++) {
      delete this[i];
    }
    this._length = len;
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
  getPropertyValue(property) {
    if (this._values.has(property)) {
      return this._values.get(property).toString();
    }
    return "";
  }

  /**
   * @param {string} property
   */
  getPropertyPriority(property) {
    return this._priorities.get(property) || "";
  }

  /**
   * @param {string} prop
   * @param {string} val
   * @param {string} prior
   */
  setProperty(prop, val, prior) {
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
    const priority = prior === "important" ? "important" : "";
    const isCustomProperty = prop.startsWith("--");
    if (isCustomProperty) {
      this._setProperty(prop, value, priority);
      return;
    }
    const property = asciiLowercase(prop);
    if (!propertyDefinitions.has(property)) {
      return;
    }
    if (priority) {
      this._priorities.set(property, priority);
    } else {
      this._priorities.delete(property);
    }
    this[property] = value;
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

  get parentRule() {
    return this._parentRule;
  }

  // Internal methods
  /**
   * @param {string} property
   * @param {string} val
   * @param {string} priority
   */
  _setProperty(property, val, priority) {
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
    if (priority === "important") {
      this._priorities.set(property, priority);
    } else {
      this._priorities.delete(property);
    }
    this._values.set(property, val);
    if (typeof this._onChange === "function" && this.cssText !== originalText && !this._updating) {
      this._onChange(this.cssText);
    }
  }

  /**
   * @param {string} prop
   * @param {object|Array|string} val
   * @param {string} prior
   */
  _borderSetter(prop, val, prior) {
    const properties = new Map();
    if (prop === "border") {
      let priority = "";
      if (typeof prior === "string") {
        priority = prior;
      } else {
        priority = this._priorities.get(prop) ?? "";
      }
      properties.set(prop, { propery: prop, value: val, priority });
    } else {
      for (let i = 0; i < this._length; i++) {
        const property = this[i];
        if (borderProperties.has(property)) {
          const value = this.getPropertyValue(property);
          const longhandPriority = this._priorities.get(property) ?? "";
          let priority = longhandPriority;
          if (prop === property && typeof prior === "string") {
            priority = prior;
          }
          properties.set(property, { property, value, priority });
        }
      }
    }
    const parsedProperties = prepareBorderProperties(prop, val, prior, properties, {
      globalObject: this._global,
      options: this._options
    });
    for (const [property, item] of parsedProperties) {
      const { priority, value } = item;
      this._setProperty(property, value, priority);
    }
  }

  /**
   * @param {string} prop
   * @param {string} val
   * @param {string} prior
   * @param {string} shorthandProperty
   */
  _flexBoxSetter(prop, val, prior, shorthandProperty) {
    if (!shorthandProperty || !shorthandProperties.has(shorthandProperty)) {
      return;
    }
    const shorthandPriority = this._priorities.get(shorthandProperty);
    this.removeProperty(shorthandProperty);
    let priority = "";
    if (typeof prior === "string") {
      priority = prior;
    } else {
      priority = this._priorities.get(prop) ?? "";
    }
    this.removeProperty(prop);
    if (shorthandPriority && priority) {
      this._setProperty(prop, val);
    } else {
      this._setProperty(prop, val, priority);
    }
    if (val && !hasVarFunc(val)) {
      const longhandValues = [];
      const shorthandItem = shorthandProperties.get(shorthandProperty);
      let hasGlobalKeyword = false;
      for (const [longhandProperty] of shorthandItem.shorthandFor) {
        if (longhandProperty === prop) {
          if (isGlobalKeyword(val)) {
            hasGlobalKeyword = true;
          }
          longhandValues.push(val);
        } else {
          const longhandValue = this.getPropertyValue(longhandProperty);
          const longhandPriority = this._priorities.get(longhandProperty) ?? "";
          if (!longhandValue || longhandPriority !== priority) {
            break;
          }
          if (isGlobalKeyword(longhandValue)) {
            hasGlobalKeyword = true;
          }
          longhandValues.push(longhandValue);
        }
      }
      if (longhandValues.length === shorthandItem.shorthandFor.size) {
        if (hasGlobalKeyword) {
          const [firstValue, ...restValues] = longhandValues;
          if (restValues.every((value) => value === firstValue)) {
            this._setProperty(shorthandProperty, firstValue, priority);
          }
        } else {
          const parsedValue = shorthandItem.parse(longhandValues.join(" "));
          if (parsedValue) {
            const shorthandValue = Object.values(parsedValue).join(" ");
            this._setProperty(shorthandProperty, shorthandValue, priority);
          }
        }
      }
    }
  }

  /**
   * @param {string} prop
   * @param {Array|string} val
   * @param {string} prior
   */
  _positionShorthandSetter(prop, val, prior) {
    if (!shorthandProperties.has(prop)) {
      return;
    }
    const shorthandValues = [];
    if (Array.isArray(val)) {
      shorthandValues.push(...val);
    } else if (typeof val === "string") {
      shorthandValues.push(val);
    } else {
      return;
    }
    let priority = "";
    if (typeof prior === "string") {
      priority = prior;
    } else {
      priority = this._priorities.get(prop) ?? "";
    }
    const { position, shorthandFor } = shorthandProperties.get(prop);
    let hasPriority = false;
    for (const [longhandProperty, longhandItem] of shorthandFor) {
      const { position: longhandPosition } = longhandItem;
      const longhandValue = getPositionValue(shorthandValues, longhandPosition);
      if (priority) {
        this._setProperty(longhandProperty, longhandValue, priority);
      } else {
        const longhandPriority = this._priorities.get(longhandProperty) ?? "";
        if (longhandPriority) {
          hasPriority = true;
        } else {
          this._setProperty(longhandProperty, longhandValue, priority);
        }
      }
    }
    if (hasPriority) {
      this.removeProperty(prop);
    } else {
      const shorthandValue = getPositionValue(shorthandValues, position);
      this._setProperty(prop, shorthandValue, priority);
    }
  }

  /**
   * @param {string} prop
   * @param {string} val
   * @param {string} prior
   * @param {string} shorthandProperty
   */
  _positionLonghandSetter(prop, val, prior, shorthandProperty) {
    if (!shorthandProperty || !shorthandProperties.has(shorthandProperty)) {
      return;
    }
    const shorthandPriority = this._priorities.get(shorthandProperty);
    this.removeProperty(shorthandProperty);
    let priority = "";
    if (typeof prior === "string") {
      priority = prior;
    } else {
      priority = this._priorities.get(prop) ?? "";
    }
    this.removeProperty(prop);
    if (shorthandPriority && priority) {
      this._setProperty(prop, val);
    } else {
      this._setProperty(prop, val, priority);
    }
    if (val && !hasVarFunc(val)) {
      const longhandValues = [];
      const { shorthandFor, position: shorthandPosition } =
        shorthandProperties.get(shorthandProperty);
      for (const [longhandProperty] of shorthandFor) {
        const longhandValue = this.getPropertyValue(longhandProperty);
        const longhandPriority = this._priorities.get(longhandProperty) ?? "";
        if (!longhandValue || longhandPriority !== priority) {
          return;
        }
        longhandValues.push(longhandValue);
      }
      if (longhandValues.length === shorthandFor.size) {
        const replacedValue = getPositionValue(longhandValues, shorthandPosition);
        this._setProperty(shorthandProperty, replacedValue, priority);
      }
    }
  }
}

// Properties
Object.defineProperties(CSSStyleDeclaration.prototype, generatedProperties);

// Additional properties
for (const definition of propertyDefinitions.values()) {
  const { legacyAliasOf, name, styleDeclaration } = definition;
  const property = legacyAliasOf ?? name;
  if (!Object.hasOwn(generatedProperties, property)) {
    const declaration = getPropertyDescriptor(property);
    for (const aliasProperty of styleDeclaration) {
      Object.defineProperty(CSSStyleDeclaration.prototype, aliasProperty, declaration);
    }
  }
}

module.exports = {
  CSSStyleDeclaration
};
