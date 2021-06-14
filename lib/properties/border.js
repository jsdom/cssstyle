'use strict';

const {
  createShorthandGetter,
  createShorthandSetter,
  serializeShorthand,
} = require('../parsers.js');

const longhands = {
  'border-width': require('./borderWidth.js'),
  'border-style': require('./borderStyle.js'),
  'border-color': require('./borderColor.js'),
};
const allLonghands = Object.values(longhands).reduce((all, { longhands }) => {
  longhands.forEach(longhand => (all[longhand] = ''));
  return all;
}, {});

function serialize(components) {
  if (components.every((value, index) => value === components[index - (index % 4)])) {
    return serializeShorthand([components[0], components[4], components[8]]);
  }
  return '';
}

module.exports.definition = {
  set: createShorthandSetter(longhands),
  get: createShorthandGetter(allLonghands, serialize),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(allLonghands);
module.exports.serialize = serialize;
