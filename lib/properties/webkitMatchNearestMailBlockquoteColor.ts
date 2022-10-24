import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('-webkit-match-nearest-mail-blockquote-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('-webkit-match-nearest-mail-blockquote-color');
  },
  enumerable: true,
  configurable: true,
};
