'use strict';

const {
  parseGeometryBox,
  parseKeyword,
  parseResource,
  parseBasicShape,
  splitTokens,
} = require('../parsers.js');

function parseShapeGeometry(val) {
  const [args] = splitTokens(val);
  if (args.length === 2) {
    let shape = parseBasicShape(args[0]);
    let box = parseGeometryBox(args[1]);
    if (!shape && !box) {
      shape = parseBasicShape(args[1]);
      box = parseGeometryBox(args[0]);
    }
    if (shape && box) {
      return `${shape} ${box}`;
    }
  }
  return parseBasicShape(val) || parseGeometryBox(val);
}

function parse(val) {
  return parseResource(val) || parseShapeGeometry(val) || parseKeyword(val, ['none']);
}

module.exports.definition = {
  set: function(v) {
    this._setProperty('clip-path', parse(v));
  },
  get: function() {
    return this.getPropertyValue('clip-path');
  },
  enumerable: true,
  configurable: true,
};
