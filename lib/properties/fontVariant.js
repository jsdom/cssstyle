'use strict';

var valid_variants = ['normal', 'small-caps', 'inherit'];

function parse(v) {
  if (valid_variants.indexOf(v.toLowerCase()) !== -1) {
    return v;
  }
}

module.exports.definition = {
  set(v) {
    this._setProperty('font-variant', parse(v));
  },
  get() {
    return this.getPropertyValue('font-variant');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
