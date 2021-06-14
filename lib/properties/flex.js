'use strict';

const { createShorthandGetter, createShorthandSetter, parseShorthand } = require('../parsers.js');

function parse(v) {
  const parsed = parseShorthand(v, longhands);
  if (parsed) {
    if (parsed['flex-grow'] === 'initial') {
      parsed['flex-grow'] = '1';
    }
    if (parsed['flex-shrink'] === 'initial') {
      parsed['flex-shrink'] = '1';
    }
    if (parsed['flex-basis'] === 'initial') {
      parsed['flex-basis'] = '0%';
    }
  }
  return parsed;
}

const longhands = {
  'flex-grow': require('./flexGrow.js'),
  'flex-shrink': require('./flexShrink.js'),
  'flex-basis': require('./flexBasis.js'),
};

const set = createShorthandSetter(longhands, parse);

module.exports.definition = {
  set(v) {
    if (v.toLowerCase() === 'none') {
      v = '0 0 auto';
    }
    set.call(this, v);
  },
  get: createShorthandGetter(longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
