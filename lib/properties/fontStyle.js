'use strict';

var valid_styles = ['normal', 'italic', 'oblique', 'inherit'];

function parse(v) {
  if (valid_styles.indexOf(v.toLowerCase()) !== -1) {
    return v;
  }
}

module.exports.definition = {
  set(v) {
    this._setProperty('font-style', parse(v));
  },
  get() {
    return this.getPropertyValue('font-style');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
