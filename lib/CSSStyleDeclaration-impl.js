/*********************************************************************
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 ********************************************************************/
'use strict';
const CSSOM = require('cssom');

const { cssPropertyToIDLAttribute, parseKeyword, serializeShorthand } = require('./parsers.js');
const idlUtils = require('./utils.js');
const implementedProperties = require('./implementedProperties.js');
const supportedProperties = require('./supportedProperties.js');

class CSSStyleDeclarationImpl {
  /**
   * @constructor
   * @see https://drafts.csswg.org/cssom/#cssstyledeclaration
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
    this._list = [];
    this._onChange = onChangeCallback || (() => {});
    this.parentRule = null;
  }

  /**
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-cssfloat
   */
  get cssFloat() {
    return this.getPropertyValue('float');
  }

  set cssFloat(value) {
    this.setProperty('float', value);
  }

  /**
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-csstext
   */
  get cssText() {
    const { _list } = this;
    const declarations = [];
    for (let i = 0; i < _list.length; i++) {
      const property = _list[i];
      const value = this.getPropertyValue(property);
      const priority = this.getPropertyPriority(property);
      declarations.push([property, value, priority]);
    }
    return serializeCSSDeclarationBlock(declarations);
  }

  set cssText(value) {
    this._values = Object.create(null);
    this._importants = Object.create(null);
    this._list = [];
    let dummyRule;
    try {
      dummyRule = CSSOM.parse('#bogus{' + value + '}').cssRules[0].style;
    } catch (err) {
      // malformed css, just return
      return;
    }
    const rule_length = dummyRule.length;
    for (let i = 0; i < rule_length; ++i) {
      const name = dummyRule[i];
      this.setProperty(
        dummyRule[i],
        dummyRule.getPropertyValue(name),
        dummyRule.getPropertyPriority(name)
      );
    }
    this._onChange(this.cssText);
  }

  /**
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-length
   */
  get length() {
    return this._list.length;
  }

  /**
   * @param {string} property
   * @return {string}
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-getpropertyvalue
   */
  getPropertyValue(property) {
    if (!property.startsWith('--')) {
      property = property.toLowerCase();
      const shorthand = shorthands.find(([shorthand]) => shorthand === property);
      if (shorthand) {
        const [, longhands] = shorthand;
        const { length: longhandLength } = longhands;
        const list = [];
        let prevPriority = null;
        for (let i = 0; i < longhandLength; i++) {
          const longhand = longhands[i];
          const declaration = this._values[longhand];
          if (declaration) {
            const priority = this.getPropertyPriority(longhand);
            if (priority === prevPriority || prevPriority === null) {
              prevPriority = priority;
              list.push([longhand, declaration]);
              continue;
            }
          }
          return '';
        }
        return serializeCSSValue(list);
      }
    }
    const declaration = this._values[property];
    if (declaration) {
      return serializeCSSValue(declaration);
    }
    return '';
  }

  /**
   * @param {string} property
   * @param {string} value
   * @param {string} [priority=""] "important" or ""
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty
   */
  setProperty(property, value, priority = '') {
    if (value === '') {
      this.removeProperty(property);
      return;
    }
    if (priority && priority.toLowerCase() !== 'important') {
      return;
    }
    /**
     * The remaining steps of this procedure are achieved in the property setter
     * (parse value) and _setProperty (set the CSS declaration).
     */
    if (property.startsWith('--')) {
      this._setProperty(property, value, !!priority);
      this._importants[property] = priority;
    } else {
      property = property.toLowerCase();
      if (implementedProperties.has(property)) {
        this[property] = value;
        this._importants[property] = priority;
      } else if (supportedProperties.has(property)) {
        this._setProperty(property, value, priority);
        this._importants[property] = priority;
      }
    }
  }

  /**
   * @param {string} property
   * @param {string | null} value
   * @param {boolean} priority
   * @returns {void}
   * @see https://drafts.csswg.org/cssom/#set-a-css-declaration
   */
  _setProperty(property, value, priority) {
    if (value === null) {
      return;
    }
    if (value === '') {
      this.removeProperty(property);
      return;
    }
    if (this._values[property]) {
      // Property already exist. Overwrite it.
      if (!this._list.includes(property)) {
        this._list.push(property);
      }
    } else {
      // New property.
      this._list.push(property);
    }
    this._values[property] = value;
    this._importants[property] = priority;
    this._onChange(this.cssText);
  }

  /**
   * @param {string} property
   * @return {string}
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-removeproperty
   */
  removeProperty(property) {
    if (!idlUtils.hasOwn(this._values, property)) {
      return '';
    }

    if (!property.startsWith('--')) {
      property = property.toLowerCase();
    }
    const prevValue = this.getPropertyValue(property);
    const shorthand = shorthands.find(([shorthand]) => shorthand === property);
    if (shorthand) {
      const [, longhands] = shorthand;
      longhands.forEach(longhand => this.removeProperty(longhand));
    } else if (this._values[property]) {
      delete this._values[property];
      delete this._importants[property];
      const index = this._list.indexOf(property);
      // That's what WebKit and Opera do
      this._list.splice(index, 1);
      // That's what Firefox does
      //this[index] = ""
      this._onChange(this.cssText);
    }

    return prevValue;
  }

  /**
   * @param {string} property
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-getpropertypriority
   */
  getPropertyPriority(property) {
    if (!property.startsWith('--')) {
      property = property.toLowerCase();
      const shorthand = shorthands.find(([shorthand]) => shorthand === property);
      if (shorthand) {
        const [, longhands] = shorthand;
        if (longhands.every(longhand => this.getPropertyPriority(longhand) === 'important')) {
          return 'important';
        }
      }
    }
    return this._importants[property] || '';
  }

  /**
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-item
   */
  item(index) {
    return this._list[index] || '';
  }

  [idlUtils.supportsPropertyIndex](index) {
    return index >= 0 && index < this._list.length;
  }

  [idlUtils.supportedPropertyIndices]() {
    return this._list.keys();
  }
}

/**
 * @param {string} value
 * @returns {string}
 * @see https://drafts.csswg.org/css-syntax-3/#input-preprocessing
 */
function preprocess(value) {
  return value
    .replace(/\r|\f|\r\n/g, '\\n')
    .replace(/\0/, '�')
    .trim();
}

/**
 * @param {string} property
 * @param {function} setter
 * @param {array} longhands
 * @returns {void}
 *
 * This "higher order" setter preprocesses value and handles empty string and
 * CSS wide keywords for all properties.
 */
function createSetter(property, setter, longhands) {
  return function set(value) {
    value = preprocess(value);
    if (value === '') {
      if (longhands) {
        longhands.forEach(longhand => (this[longhand] = ''));
      }
      this.removeProperty(property);
      return;
    }
    const cssWideKeyword = parseKeyword(value);
    if (cssWideKeyword) {
      if (longhands) {
        longhands.forEach(longhand => (this[longhand] = cssWideKeyword));
      } else {
        this._setProperty(property, cssWideKeyword);
      }
      return;
    }
    setter.call(this, value);
  };
}

const shorthands = [];

implementedProperties.forEach(property => {
  // camelCased if prefixed, otherwise PascalCased
  const attribute = cssPropertyToIDLAttribute(property);
  const filename = attribute[0].toLowerCase() + attribute.slice(1);
  const {
    definition,
    longhands,
    serialize = serializeShorthand,
  } = require(`./properties/${filename}.js`);
  if (longhands) {
    shorthands.push([property, longhands, serialize]);
  }
  definition.set = createSetter(property, definition.set, longhands);
  Object.defineProperty(CSSStyleDeclarationImpl.prototype, property, definition);
  Object.defineProperty(CSSStyleDeclarationImpl.prototype, attribute, definition);
  if (property.startsWith('-webkit-')) {
    Object.defineProperty(CSSStyleDeclarationImpl.prototype, filename, definition);
  }
});

exports.implementation = CSSStyleDeclarationImpl;

/**
 * @see https://drafts.csswg.org/cssom/#concept-shorthands-preferred-order
 *
 * TODO: handle sorting shorthands starting with "-".
 */
shorthands.sort(([, a], [, b]) => b.length - a.length);

/**
 * @param {string|array} declaration or list of declarations
 * @returns {string|array}
 * @see https://drafts.csswg.org/cssom/#serialize-a-css-value
 *
 * TODO: serialize all property value here instead of in parsers.
 */
function serializeCSSValue(declaration) {
  // Longhand declarations
  if (Array.isArray(declaration)) {
    const properties = [];
    const values = [];
    declaration.forEach(([property, value]) => {
      properties.push(property);
      values.push(value);
    });
    // First shorthand that exactly maps to all of the longhand properties
    const shorthand = shorthands.find(
      ([, longhands]) =>
        longhands.length === properties.length &&
        properties.every(property => longhands.includes(property))
    );
    if (shorthand) {
      /**
       * "If component values can be omitted or replaced with a shorter
       * representation without changing the meaning of the value, omit/replace
       * them."
       *
       * "If certain component values can appear in any order without changing
       * the meaning of the value, reorder the component values to use the
       * canonical order of component values as given in the property definition
       * table."
       */
      const [, , serialize] = shorthand;
      return serialize(values);
    }
    return '';
  }
  return declaration;
}

/**
 * @param {string} property
 * @param {string} value
 * @param {boolean} priority
 * @returns {string}
 * @see https://drafts.csswg.org/cssom/#serialize-a-css-declaration
 */
function serializeCSSDeclaration(property, value, priority) {
  let s = `${property}: ${value}`;
  if (priority) {
    s += ' !important';
  }
  return s + ';';
}

/**
 * @param {array} declarations
 * @returns {string}
 * @see https://drafts.csswg.org/cssom/#serialize-a-css-declaration-block
 */
function serializeCSSDeclarationBlock(declarations) {
  const list = [];
  const alreadySerialized = [];

  declarationLoop: for (let i = 0; i < declarations.length; i++) {
    const [property, value, priority] = declarations[i];

    if (alreadySerialized.includes(property)) {
      continue declarationLoop;
    }

    const propertyShorthands = shorthands.filter(([, properties]) => properties.includes(property));
    const { length: propertyShorthandsLength } = propertyShorthands;

    shorthandLoop: for (let j = 0; j < propertyShorthandsLength; j++) {
      const [shorthand, properties] = propertyShorthands[j];

      // All longhand declarations left that share this shorthand
      const longhands = declarations.filter(([property]) => {
        if (alreadySerialized.includes(property)) {
          return false;
        }
        return propertyShorthands.some(([, properties]) => properties.includes(property));
      });

      // All properties that map to shorthand should be present in longhand declarations
      if (!properties.every(property => longhands.some(([longhand]) => longhand === property))) {
        continue shorthandLoop;
      }

      const priorities = [];
      const currentLonghands = [];
      longhands.forEach(declaration => {
        const [property, , priority] = declaration;
        if (properties.includes(property)) {
          currentLonghands.push(declaration);
          priorities.push(priority);
        }
      });
      const priority = priorities.every(Boolean);

      // None or all longhand declarations for this shorthand should have the priority flag
      if (priorities.some(Boolean) && !priority) {
        continue shorthandLoop;
      }

      const value = serializeCSSValue(currentLonghands);

      if (value === '') {
        continue shorthandLoop;
      }

      list.push(serializeCSSDeclaration(shorthand, value, priority));
      alreadySerialized.push(...properties);
      continue declarationLoop;
    }

    list.push(serializeCSSDeclaration(property, serializeCSSValue(value), priority));
    alreadySerialized.push(property);
  }
  return list.join(' ');
}
