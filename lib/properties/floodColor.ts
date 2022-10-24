import { parseColor } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('flood-color', parseColor(v));
  },
  get: function () {
    return this.getPropertyValue('flood-color');
  },
  enumerable: true,
  configurable: true,
};
