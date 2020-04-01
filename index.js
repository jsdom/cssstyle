'use strict';
const webidlWrapper = require('./webidl2js-wrapper.js');

const sharedGlobalObject = {};
webidlWrapper.install(sharedGlobalObject, ['Window']);

const origCSSStyleDeclaration = sharedGlobalObject.CSSStyleDeclaration;

/**
 * @constructor
 * @param {((cssText: string) => void) | null} [onChangeCallback]
 * The callback that is invoked whenever a property changes.
 */
function CSSStyleDeclaration(onChangeCallback = null) {
  if (new.target === undefined) {
    throw new TypeError("Class constructor CSSStyleDeclaration cannot be invoked without 'new'");
  }

  if (onChangeCallback !== null && typeof onChangeCallback !== 'function') {
    throw new TypeError('Failed to construct CSSStyleDeclaration: parameter 1 is not a function');
  }

  return webidlWrapper.create(sharedGlobalObject, undefined, { onChangeCallback });
}

sharedGlobalObject.CSSStyleDeclaration = CSSStyleDeclaration;
Object.defineProperty(CSSStyleDeclaration, 'prototype', {
  value: origCSSStyleDeclaration.prototype,
  writable: false,
});
CSSStyleDeclaration.prototype.constructor = CSSStyleDeclaration;
Object.setPrototypeOf(CSSStyleDeclaration, Object.getPrototypeOf(origCSSStyleDeclaration));

module.exports = CSSStyleDeclaration;
