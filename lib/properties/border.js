'use strict';

var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;

const longhands = {
  'border-width': require('./borderWidth'),
  'border-style': require('./borderStyle'),
  'border-color': require('./borderColor'),
};

var myShorthandSetter = shorthandSetter('border', longhands);
var myShorthandGetter = shorthandGetter('border', longhands);

module.exports.definition = {
  set: function(v) {
    if (v.toLowerCase() === 'none') {
      // TOFIX: this behavior is wrong
      return (this['border'] = '');
    }
    myShorthandSetter.call(this, v);
    this.removeProperty('border-top');
    this.removeProperty('border-left');
    this.removeProperty('border-right');
    this.removeProperty('border-bottom');
    this._values['border-top'] = this._values.border;
    this._values['border-left'] = this._values.border;
    this._values['border-right'] = this._values.border;
    this._values['border-bottom'] = this._values.border;
  },
  get: myShorthandGetter,
  enumerable: true,
  configurable: true,
};
module.exports.longhands = Object.keys(longhands).concat(
  'border-top',
  'border-right',
  'border-bottom',
  'border-left'
);
