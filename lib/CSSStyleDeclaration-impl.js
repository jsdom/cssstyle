/*********************************************************************
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 ********************************************************************/
'use strict';
var CSSOM = require('cssom');
var allProperties = require('./allProperties');
var allExtraProperties = require('./allExtraProperties');
var implementedProperties = require('./implementedProperties');
var { cssPropertyToIDLAttribute } = require('./parsers');
var getBasicPropertyDescriptor = require('./utils/getBasicPropertyDescriptor');
const idlUtils = require('./utils.js');

class CSSStyleDeclarationImpl {
  /**
   * @constructor
   * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration
   *
   * @param {object} globalObject
   * @param {*[]} args
   * @param {object} privateData
   * @param {((cssText: string) => void) | null} [privateData.onChangeCallback]
   */
  constructor(globalObject, args, { onChangeCallback }) {
    this._globalObject = globalObject;
    this._values = Object.create(null);
    this._importants = Object.create(null);
    this._length = 0;
    this._onChange = onChangeCallback || (() => {});
    this.parentRule = null;
  }

  /**
   *
   * @param {string} name
   * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-getPropertyValue
   * @return {string} the value of the property if it has been explicitly set for this declaration block.
   * Returns the empty string if the property has not been set.
   */
  getPropertyValue(name) {
    return this._values[name] || '';
  }

  /**
   *
   * @param {string} name
   * @param {string} value
   * @param {string} [priority=""] "important" or ""
   * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-setProperty
   */
  setProperty(name, value, priority = '') {
    if (value === '') {
      this.removeProperty(name);
      return;
    }
    var isCustomProperty = name.indexOf('--') === 0;
    if (isCustomProperty) {
      this._setProperty(name, value, priority);
      return;
    }
    var lowercaseName = name.toLowerCase();
    if (!allProperties.has(lowercaseName) && !allExtraProperties.has(lowercaseName)) {
      return;
    }

    this[lowercaseName] = value;
    this._importants[lowercaseName] = priority;
  }

  /**
   * @param {string} name
   * @param {string | null} value
   * @param {string} [priority=""]
   */
  _setProperty(name, value, priority = '') {
    // FIXME: A good chunk of the implemented properties call this method
    // with `value = undefined`, expecting it to do nothing:
    if (value === undefined) {
      return;
    }
    if (value === null || value === '') {
      this.removeProperty(name);
      return;
    }
    if (this._values[name]) {
      // Property already exist. Overwrite it.
      var index = Array.prototype.indexOf.call(this, name);
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
    this._onChange(this.cssText);
  }

  /**
   *
   * @param {string} name
   * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-removeProperty
   * @return {string} the value of the property if it has been explicitly set for this declaration block.
   * Returns the empty string if the property has not been set or the property name does not correspond to a known CSS property.
   */
  removeProperty(name) {
    if (!idlUtils.hasOwn(this._values, name)) {
      return '';
    }

    var prevValue = this._values[name];
    delete this._values[name];
    delete this._importants[name];

    var index = Array.prototype.indexOf.call(this, name);
    if (index < 0) {
      return prevValue;
    }

    // That's what WebKit and Opera do
    Array.prototype.splice.call(this, index, 1);

    // That's what Firefox does
    //this[index] = ""

    this._onChange(this.cssText);
    return prevValue;
  }

  /**
   *
   * @param {String} name
   */
  getPropertyPriority(name) {
    return this._importants[name] || '';
  }

  /**
   *   http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-item
   */
  item(index) {
    if (index < 0 || index >= this._length) {
      return '';
    }
    return this[index];
  }

  [idlUtils.supportsPropertyIndex](index) {
    return index >= 0 && index < this._length;
  }

  [idlUtils.supportedPropertyIndices]() {
    return Array.prototype.keys.call(this);
  }
}

Object.defineProperties(CSSStyleDeclarationImpl.prototype, {
  cssText: {
    get: function() {
      var properties = [];
      var i;
      var name;
      var value;
      var priority;
      for (i = 0; i < this._length; i++) {
        name = this[i];
        value = this.getPropertyValue(name);
        priority = this.getPropertyPriority(name);
        if (priority !== '') {
          priority = ` !${priority}`;
        }
        properties.push(`${name}: ${value}${priority};`);
      }
      return properties.join(' ');
    },
    set: function(value) {
      var i;
      this._values = {};
      Array.prototype.splice.call(this, 0, this._length);
      this._importants = {};
      var dummyRule;
      try {
        dummyRule = CSSOM.parse('#bogus{' + value + '}').cssRules[0].style;
      } catch (err) {
        // malformed css, just return
        return;
      }
      var rule_length = dummyRule.length;
      var name;
      for (i = 0; i < rule_length; ++i) {
        name = dummyRule[i];
        this.setProperty(
          dummyRule[i],
          dummyRule.getPropertyValue(name),
          dummyRule.getPropertyPriority(name)
        );
      }
      this._onChange(this.cssText);
    },
    enumerable: true,
    configurable: true,
  },
  length: {
    get: function() {
      return this._length;
    },
    /**
     * This deletes indices if the new length is less then the current
     * length. If the new length is more, it does nothing, the new indices
     * will be undefined until set.
     **/
    set: function(value) {
      var i;
      for (i = value; i < this._length; i++) {
        delete this[i];
      }
      this._length = value;
    },
    enumerable: true,
    configurable: true,
  },
});

require('./properties')(CSSStyleDeclarationImpl.prototype);

// TODO: Consider using `[Reflect]` for basic properties
allProperties.forEach(function(property) {
  if (!implementedProperties.has(property)) {
    var declaration = getBasicPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclarationImpl.prototype, property, declaration);
    Object.defineProperty(
      CSSStyleDeclarationImpl.prototype,
      cssPropertyToIDLAttribute(property),
      declaration
    );
  }
});

allExtraProperties.forEach(function(property) {
  if (!implementedProperties.has(property)) {
    var declaration = getBasicPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclarationImpl.prototype, property, declaration);
    Object.defineProperty(
      CSSStyleDeclarationImpl.prototype,
      cssPropertyToIDLAttribute(property),
      declaration
    );
    if (property.startsWith('-webkit-')) {
      Object.defineProperty(
        CSSStyleDeclarationImpl.prototype,
        cssPropertyToIDLAttribute(property, /* lowercaseFirst = */ true),
        declaration
      );
    }
  }
});

exports.implementation = CSSStyleDeclarationImpl;
