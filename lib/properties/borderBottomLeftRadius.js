'use strict';

const { parseLengthOrPercentage, splitTokens } = require('../parsers');

function parse(v) {
  const [radii] = splitTokens(v);
  if (radii.every((radius, i) => (radii[i] = parseLengthOrPercentage(radius)))) {
    const [horizontal, vertical] = radii;
    if (horizontal === vertical) {
      return horizontal;
    }
    return radii.join(' ');
  }
}

module.exports.definition = {
  set: function(v) {
    this._setProperty('border-bottom-left-radius', parse(v));
  },
  get: function() {
    return this.getPropertyValue('border-bottom-left-radius');
  },
  enumerable: true,
  configurable: true,
};
