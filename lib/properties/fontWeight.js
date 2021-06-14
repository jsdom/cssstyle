'use strict';

var valid_weights = [
  'normal',
  'bold',
  'bolder',
  'lighter',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  'inherit',
];

function parse(v) {
  if (valid_weights.indexOf(v.toLowerCase()) !== -1) {
    return v;
  }
}

module.exports.definition = {
  set(v) {
    this._setProperty('font-weight', parse(v));
  },
  get() {
    return this.getPropertyValue('font-weight');
  },
  enumerable: true,
  configurable: true,
};
module.exports.parse = parse;
