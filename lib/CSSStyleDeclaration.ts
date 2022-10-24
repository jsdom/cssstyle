/*********************************************************************
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 ********************************************************************/
import { BasicPropertyDescriptorThis } from './utils/getBasicPropertyDescriptor';

import CSSOM from 'cssom';
import { dashedToCamelCase } from './parsers';
import { getBasicPropertyDescriptor } from './utils/getBasicPropertyDescriptor';
import { ALL_PROPERTIES } from './allProperties';
import { ALL_EXTRA_PROPERTIES } from './allExtraProperties';
import { defineProperties } from './generated/properties';
import { IMPLEMENTED_PROPERTIES } from './generated/implemented-properties';

type CSSStyleDeclarationThis = {
  -readonly [Key in keyof BasicPropertyDescriptorThis]: BasicPropertyDescriptorThis[Key];
};
/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration
 */
export const CSSStyleDeclaration = function CSSStyleDeclaration(
  this: CSSStyleDeclarationThis,
  onChangeCallback?: (cssText: string) => void
) {
  this._values = {};
  this._importants = {};
  this._length = 0;
  this._onChange =
    onChangeCallback ||
    function () {
      return;
    };
};
CSSStyleDeclaration.prototype = {
  constructor: CSSStyleDeclaration,

  /**
   *
   * @param {string} name
   * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-getPropertyValue
   * @return {string} the value of the property if it has been explicitly set for this declaration block.
   * Returns the empty string if the property has not been set.
   */
  getPropertyValue: function (name: string) {
    if (!this._values.hasOwnProperty(name)) {
      return '';
    }
    return this._values[name].toString();
  },

  /**
   *
   * @param {string} name
   * @param {string} value
   * @param {string} [priority=null] "important" or null
   * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-setProperty
   */
  setProperty: function (name: string, value: string, priority: 'important' | undefined) {
    if (value === undefined) {
      return;
    }
    if (value === null || value === '') {
      this.removeProperty(name);
      return;
    }
    const isCustomProperty = name.indexOf('--') === 0;
    if (isCustomProperty) {
      this._setProperty(name, value, priority);
      return;
    }
    const lowercaseName = name.toLowerCase();
    if (!ALL_PROPERTIES.has(lowercaseName) && !ALL_EXTRA_PROPERTIES.has(lowercaseName)) {
      return;
    }

    this[lowercaseName] = value;
    this._importants[lowercaseName] = priority;
  },
  _setProperty: function (name: string, value: unknown, priority?: 'important') {
    if (value === undefined) {
      return;
    }
    if (value === null || value === '') {
      this.removeProperty(name);
      return;
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
    this._onChange(this.cssText);
  },

  /**
   *
   * @param {string} name
   * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-removeProperty
   * @return {string} the value of the property if it has been explicitly set for this declaration block.
   * Returns the empty string if the property has not been set or the property name does not correspond to a known CSS property.
   */
  removeProperty: function (name: string) {
    if (!this._values.hasOwnProperty(name)) {
      return '';
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
    //this[index] = ""

    this._onChange(this.cssText);
    return prevValue;
  },

  /**
   *
   * @param {String} name
   */
  getPropertyPriority: function (name: string) {
    return this._importants[name] || '';
  },

  getPropertyCSSValue: function () {
    //FIXME
    return;
  },

  /**
   *   element.style.overflow = "auto"
   *   element.style.getPropertyShorthand("overflow-x")
   *   -> "overflow"
   */
  getPropertyShorthand: function () {
    //FIXME
    return;
  },

  isPropertyImplicit: function () {
    //FIXME
    return;
  },

  /**
   *   http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-item
   */
  item: function (index) {
    index = parseInt(index, 10);
    if (index < 0 || index >= this._length) {
      return '';
    }
    return this[index];
  },
};

Object.defineProperties(CSSStyleDeclaration.prototype, {
  cssText: {
    get: function () {
      const properties = [];
      let i;
      let name;
      let value;
      let priority;
      for (i = 0; i < this._length; i++) {
        name = this[i];
        value = this.getPropertyValue(name);
        priority = this.getPropertyPriority(name);
        if (priority !== '') {
          priority = ' !' + priority;
        }
        properties.push([name, ': ', value, priority, ';'].join(''));
      }
      return properties.join(' ');
    },
    set: function (value) {
      let i;
      this._values = {};
      Array.prototype.splice.call(this, 0, this._length);
      this._importants = {};
      let dummyRule;
      try {
        dummyRule = CSSOM.parse('#bogus{' + value + '}').cssRules[0].style;
      } catch (err) {
        // malformed css, just return
        return;
      }
      const rule_length = dummyRule.length;
      let name;
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
  parentRule: {
    get: function () {
      return null;
    },
    enumerable: true,
    configurable: true,
  },
  length: {
    get: function () {
      return this._length;
    },
    /**
     * This deletes indices if the new length is less then the current
     * length. If the new length is more, it does nothing, the new indices
     * will be undefined until set.
     **/
    set: function (value) {
      let i;
      for (i = value; i < this._length; i++) {
        delete this[i];
      }
      this._length = value;
    },
    enumerable: true,
    configurable: true,
  },
});

defineProperties(CSSStyleDeclaration.prototype);
// require('./properties')(CSSStyleDeclaration.prototype);

ALL_PROPERTIES.forEach(function (property) {
  if (!IMPLEMENTED_PROPERTIES.has(property)) {
    const declaration = getBasicPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
  }
});

ALL_EXTRA_PROPERTIES.forEach(function (property) {
  if (!IMPLEMENTED_PROPERTIES.has(property)) {
    const declaration = getBasicPropertyDescriptor(property);
    Object.defineProperty(CSSStyleDeclaration.prototype, property, declaration);
    Object.defineProperty(CSSStyleDeclaration.prototype, dashedToCamelCase(property), declaration);
  }
});

const a = new CSSStyleDeclaration()
