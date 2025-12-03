/**
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 */
"use strict";

const generatedProperties = require("./generated/properties");
const propertyDefinitions = require("./generated/propertyDefinitions");
const { handleBorder } = require("./handlers/border");
const { handleFlex } = require("./handlers/flex");
const { handlePositionShorthand, handlePositionLonghand } = require("./handlers/position");
const { normalizeProperties, prepareProperties, shorthandProperties } = require("./normalize");
const { hasVarFunc, parseCSS, parsePropertyValue, prepareValue } = require("./parsers");
const { getCache, setCache } = require("./utils/cache");
const { ELEMENT_NODE, NO_MODIFICATION_ALLOWED_ERR } = require("./utils/constants");
const { getPropertyDescriptor } = require("./utils/propertyDescriptors");
const { asciiLowercase } = require("./utils/strings");

/* constants */
const SHORTHAND_PROPS = new Set(["border", "flex", "margin", "padding"]);

/**
 * @see https://drafts.csswg.org/cssom/#the-cssstyledeclaration-interface
 */
class CSSStyleDeclaration {
  /**
   * Creates a new CSSStyleDeclaration instance.
   *
   * @param {object} globalObject - Window object
   * @param {object} [opt] - Options
   * @param {object} [opt.context] - Element or CSSStyleRule
   * @param {string} [opt.format="specifiedValue"] - "specifiedValue" or "computedValue"
   * @param {Function} [opt.onChange] - Callback when cssText is changed or the property is removed
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

  /**
   * Textual representation of the declaration block.
   *
   * @type {string}
   */
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

  /**
   * Sets the textual representation of the declaration block.
   * This will parse the given text and update the properties accordingly.
   *
   * @param {string} val
   */
  set cssText(val) {
    this._checkReadonly();
    if (this._updating) {
      return;
    }
    this._clearProperties();
    try {
      this._updating = true;
      const valueObj = this._parseCSSText(val);
      if (valueObj?.children) {
        const properties = this._extractDeclarations(valueObj.children);
        this._applyProperties(properties);
      }
    } catch {
      return;
    } finally {
      this._updating = false;
    }
    this._notifyChange();
  }

  /**
   * The number of properties in the declaration block.
   *
   * @type {number}
   */
  get length() {
    return this._length;
  }

  /**
   * This deletes indices if the new length is less then the current length.
   * If the new length is more, it does nothing, the new indices will be undefined until set.
   *
   * @param {number} len
   */
  set length(len) {
    for (let i = len; i < this._length; i++) {
      delete this[i];
    }
    this._length = len;
  }

  /**
   * Returns the property name at the given index.
   *
   * @param {number} index
   * @returns {string}
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
   * Returns the value of the property.
   *
   * @param {string} property
   * @returns {string}
   */
  getPropertyValue(property) {
    if (this._values.has(property)) {
      return this._values.get(property).toString();
    }
    return "";
  }

  /**
   * Returns the priority of the property (e.g. "important").
   *
   * @param {string} property
   * @returns {string}
   */
  getPropertyPriority(property) {
    return this._priorities.get(property) || "";
  }

  /**
   * Sets a property with a value and optional priority.
   *
   * @param {string} prop - Property name
   * @param {string} val - Property value
   * @param {string} [prior] - Priority (e.g. "important")
   */
  setProperty(prop, val, prior) {
    this._checkReadonly(prop);
    const value = prepareValue(val, this._global);
    if (value === "") {
      this[prop] = "";
      this.removeProperty(prop);
      return;
    }
    const priority = prior === "important" ? prior : "";
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
   * Removes a property.
   *
   * @param {string} property
   * @returns {string} The value of the removed property
   */
  removeProperty(property) {
    this._checkReadonly(property);
    if (!this._values.has(property)) {
      return "";
    }
    const prevValue = this._values.get(property);
    this._values.delete(property);
    this._priorities.delete(property);
    const removed = this._removeIndex(property);
    if (removed) {
      this._notifyChange();
    }
    return prevValue;
  }

  /**
   * The CSS rule that contains this declaration block.
   *
   * @returns {object|null}
   */
  get parentRule() {
    return this._parentRule;
  }

  /**
   * Iterator for the declaration block.
   * Allows `for (const prop of style)` and `[...style]`.
   */
  *[Symbol.iterator]() {
    for (let i = 0; i < this._length; i++) {
      yield this[i];
    }
  }

  // Internal methods
  /**
   * Checks if the declaration is readonly.
   *
   * @private
   * @param {string} [property] - The property name to check, used for the error message.
   * @throws {DOMException} If the declaration is readonly.
   */
  _checkReadonly(property) {
    if (this._readonly) {
      const msg = property
        ? `Property ${property} can not be modified.`
        : "cssText can not be modified.";
      throw new this._global.DOMException(msg, NO_MODIFICATION_ALLOWED_ERR);
    }
  }

  /**
   * Triggers the onChange callback if it's a function and the text has changed.
   *
   * @private
   * @param {string|null} [originalText] - The CSS text before the change.
   */
  _notifyChange(originalText = null) {
    if (typeof this._onChange !== "function") {
      return;
    }
    if (this._updating) {
      return;
    }
    const newText = this.cssText;
    if (originalText !== null && originalText === newText) {
      return;
    }
    this._onChange(newText);
  }

  /**
   * Sets a property internally.
   *
   * @private
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
    const originalText =
      typeof this._onChange === "function" && !this._updating ? this.cssText : null;
    if (!this._values.has(property)) {
      this._addIndex(property);
    }
    if (priority === "important") {
      this._priorities.set(property, priority);
    } else {
      this._priorities.delete(property);
    }
    this._values.set(property, val);
    this._notifyChange(originalText);
  }

  /**
   * Clears all properties.
   *
   * @private
   */
  _clearProperties() {
    Array.prototype.splice.call(this, 0, this._length);
    this._values.clear();
    this._priorities.clear();
  }

  /**
   * Adds a property to the indexed properties list if not already present.
   *
   * @private
   * @param {string} property
   */
  _addIndex(property) {
    const index = Array.prototype.indexOf.call(this, property);
    if (index < 0) {
      this[this._length] = property;
      this._length++;
    }
  }

  /**
   * Removes a property from the indexed properties list.
   *
   * @private
   * @param {string} property
   * @returns {boolean} True if the property was removed.
   */
  _removeIndex(property) {
    const index = Array.prototype.indexOf.call(this, property);
    if (index >= 0) {
      Array.prototype.splice.call(this, index, 1);
      return true;
    }
    return false;
  }

  /**
   * Parses CSS text.
   *
   * @private
   * @param {string} val
   * @returns {object} The parsed CSS object.
   */
  _parseCSSText(val) {
    const cacheKey = `parseCSSText_${val}`;
    const cachedValue = getCache(cacheKey);
    if (cachedValue && Object.hasOwn(cachedValue, "children")) {
      return cachedValue;
    }
    const parsedValue = parseCSS(
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
    setCache(cacheKey, parsedValue);
    return parsedValue;
  }

  /**
   * Extracts declarations from the parsed CSS children.
   *
   * @private
   * @param {Array} children
   * @returns {Map} A map of properties to their values and priorities.
   */
  _extractDeclarations(children) {
    const properties = new Map();
    let shouldSkipNext = false;
    for (const item of children) {
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
        this._processDeclaration(item, properties);
      }
    }
    return properties;
  }

  /**
   * Processes a single declaration and adds it to the properties map.
   *
   * @private
   * @param {object} item - The declaration item.
   * @param {Map} properties - The map to add the property to.
   */
  _processDeclaration(item, properties) {
    const {
      important,
      property,
      value: { value }
    } = item;
    const priority = important ? "important" : "";
    const isCustomProperty = property.startsWith("--");

    if (isCustomProperty || hasVarFunc(value)) {
      this._addPropertyToMap(properties, property, value, priority);
    } else {
      const parsedValue = parsePropertyValue(property, value, {
        globalObject: this._global,
        options: this._options
      });
      if (parsedValue) {
        this._addPropertyToMap(properties, property, parsedValue, priority);
      } else {
        this.removeProperty(property);
      }
    }
  }

  /**
   * Adds a property to the properties map, handling existing priority.
   *
   * @private
   * @param {Map} properties
   * @param {string} property
   * @param {string} value
   * @param {string} priority
   */
  _addPropertyToMap(properties, property, value, priority) {
    if (properties.has(property)) {
      const { priority: itemPriority } = properties.get(property);
      if (!itemPriority) {
        properties.set(property, { property, value, priority });
      }
    } else {
      properties.set(property, { property, value, priority });
    }
  }

  /**
   * Applies the properties to the declaration block.
   *
   * @private
   * @param {Map} properties
   */
  _applyProperties(properties) {
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
}

// Define standard CSS properties on the prototype from the generated properties map.
Object.defineProperties(CSSStyleDeclaration.prototype, generatedProperties);

// Define alias and legacy properties based on property definitions.
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

// These handlers are mapped to internal method names expected by generated properties.
const internalSetters = {
  _borderSetter: handleBorder,
  _flexBoxSetter: handleFlex,
  _positionShorthandSetter: handlePositionShorthand,
  _positionLonghandSetter: handlePositionLonghand
};

// Assign the internal setters to the prototype.
for (const [methodName, handler] of Object.entries(internalSetters)) {
  // NOTE: 'this' must be bound to the CSSStyleDeclaration instance.
  CSSStyleDeclaration.prototype[methodName] = function (prop, ...args) {
    if (SHORTHAND_PROPS.has(prop)) {
      const originalText = typeof this._onChange === "function" ? this.cssText : null;
      try {
        this._updating = true;
        handler(this, prop, ...args);
      } catch {
        return;
      } finally {
        this._updating = false;
      }
      this._notifyChange(originalText);
    } else {
      handler(this, prop, ...args);
    }
  };
}

module.exports = {
  CSSStyleDeclaration
};
