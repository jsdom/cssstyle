/*********************************************************************
 * This is a fork from the CSS Style Declaration part of
 * https://github.com/NV/CSSOM
 ********************************************************************/
'use strict';
const CSSOM = require('cssom');

const { cssPropertyToIDLAttribute } = require('./parsers.js');
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
    const properties = [];
    for (let i = 0; i < _list.length; i++) {
      const name = _list[i];
      const value = this.getPropertyValue(name);
      let priority = this.getPropertyPriority(name);
      if (priority !== '') {
        priority = ` !${priority}`;
      }
      properties.push(`${name}: ${value}${priority};`);
    }
    return properties.join(' ');
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

  set length(value) {
    this._list.length = value;
  }

  /**
   *
   * @param {string} name
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-getpropertyvalue
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
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty
   */
  setProperty(name, value, priority = '') {
    if (value === '') {
      this.removeProperty(name);
      return;
    }

    if (name.startsWith('--')) {
      this._setProperty(name, value, priority);
      return;
    }

    const lowercaseName = name.toLowerCase();
    if (!supportedProperties.has(lowercaseName)) {
      return;
    }

    if (implementedProperties.has(lowercaseName)) {
      this[lowercaseName] = value;
    } else {
      this._setProperty(lowercaseName, value, priority);
    }
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
      if (!this._list.includes(name)) {
        this._list.push(name);
      }
    } else {
      // New property.
      this._list.push(name);
    }
    this._values[name] = value;
    this._importants[name] = priority;
    this._onChange(this.cssText);
  }

  /**
   *
   * @param {string} name
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-removeproperty
   * @return {string} the value of the property if it has been explicitly set for this declaration block.
   * Returns the empty string if the property has not been set or the property name does not correspond to a known CSS property.
   */
  removeProperty(name) {
    if (!idlUtils.hasOwn(this._values, name)) {
      return '';
    }

    const prevValue = this._values[name];
    delete this._values[name];
    delete this._importants[name];

    const index = this._list.indexOf(name);
    if (index < 0) {
      return prevValue;
    }

    // That's what WebKit and Opera do
    this._list.splice(index, 1);

    // That's what Firefox does
    //this._list[index] = ''

    this._onChange(this.cssText);
    return prevValue;
  }

  /**
   *
   * @param {String} name
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-getpropertypriority
   */
  getPropertyPriority(name) {
    return this._importants[name] || '';
  }

  /**
   * @see https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-item
   */
  item(index) {
    const { _list } = this;
    if (index < 0 || index >= _list.length) {
      return '';
    }
    return _list[index];
  }

  [idlUtils.supportsPropertyIndex](index) {
    return index >= 0 && index < this._list.length;
  }

  [idlUtils.supportedPropertyIndices]() {
    return this._list.keys();
  }
}

implementedProperties.forEach(property => {
  // camelCased if prefixed, otherwise PascalCased
  const attribute = cssPropertyToIDLAttribute(property);
  const filename = attribute[0].toLowerCase() + attribute.slice(1);
  const { definition } = require(`./properties/${filename}`);
  Object.defineProperty(CSSStyleDeclarationImpl.prototype, property, definition);
  Object.defineProperty(CSSStyleDeclarationImpl.prototype, attribute, definition);
  if (property.startsWith('-webkit-')) {
    Object.defineProperty(CSSStyleDeclarationImpl.prototype, filename, definition);
  }
});

exports.implementation = CSSStyleDeclarationImpl;
