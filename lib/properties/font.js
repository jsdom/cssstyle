'use strict';

const {
  parseKeyword,
  shorthandGetter,
  shorthandParser,
  shorthandSetter,
} = require('../parsers.js');

const longhands = {
  'font-family': require('./fontFamily'),
  'font-size': require('./fontSize'),
  'font-style': require('./fontStyle'),
  'font-variant': require('./fontVariant'),
  'font-weight': require('./fontWeight'),
  'line-height': require('./lineHeight'),
};

const staticFonts = ['caption', 'icon', 'menu', 'message-box', 'small-caption', 'status-bar'];

var setter = shorthandSetter('font', longhands);

module.exports.definition = {
  set: function(v) {
    const short = shorthandParser(v, longhands);
    if (short !== undefined) {
      return setter.call(this, v);
    }
    this._setProperty('font', parseKeyword(v, staticFonts));
  },
  get: shorthandGetter('font', longhands),
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands);
