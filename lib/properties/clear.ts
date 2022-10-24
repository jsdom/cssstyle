import { parseKeyword } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const clear_keywords = ['none', 'left', 'right', 'both', 'inherit'];

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('clear', parseKeyword(v, clear_keywords));
  },
  get: function () {
    return this.getPropertyValue('clear');
  },
  enumerable: true,
  configurable: true,
};
