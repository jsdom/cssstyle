'use strict';

const { createShorthandGetter, createShorthandSetter, parseKeyword } = require('../parsers.js');

const longhands = {
  'font-family': require('./fontFamily.js'),
  'font-size': require('./fontSize.js'),
  'font-style': require('./fontStyle.js'),
  'font-variant': require('./fontVariant.js'),
  'font-weight': require('./fontWeight.js'),
  'line-height': require('./lineHeight.js'),
};

const staticFonts = ['caption', 'icon', 'menu', 'message-box', 'small-caption', 'status-bar'];

const set = createShorthandSetter(longhands);

module.exports.definition = {
  set(v) {
    if (!set.call(this, v)) {
      const systemFont = parseKeyword(v, staticFonts);
      if (systemFont) {
        this._setProperty('font-family', systemFont);
      }
    }
  },
  get: createShorthandGetter(longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
