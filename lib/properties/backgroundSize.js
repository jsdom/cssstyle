'use strict';

const { parseKeyword, parseLengthOrPercentage, splitTokens } = require('../parsers.js');

function parse(v) {
  const keyword = parseKeyword(v, ['auto', 'cover', 'contain']);
  if (keyword !== null) {
    return keyword;
  }
  const [components] = splitTokens(v);
  const { length: componentsLength } = components;
  if (componentsLength > 2) {
    return null;
  }
  const size = [];
  for (let i = 0; i < componentsLength; i++) {
    const component = components[i];
    const parsed = parseLengthOrPercentage(component);
    if (parsed === null) {
      return null;
    }
    size.push(parsed);
  }
  return size.join(' ');
}

module.exports.definition = {
  set(v) {
    this._setProperty('background-size', parse(v));
  },
  get() {
    return this.getPropertyValue('background-size');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
