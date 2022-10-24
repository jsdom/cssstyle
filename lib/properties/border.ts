import * as borderWidth from './borderWidth';
import * as borderStyle from './borderStyle';
import * as borderColor from './borderColor';
import { shorthandGetter, shorthandSetter } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const shorthand_for = {
  'border-width': borderWidth,
  'border-style': borderStyle,
  'border-color': borderColor,
};

const myShorthandSetter = shorthandSetter('border', shorthand_for);
const myShorthandGetter = shorthandGetter('border', shorthand_for);

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    if (typeof v === 'string' && v.toString().toLowerCase() === 'none') {
      v = '';
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
