import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('float', v);
  },
  get: function () {
    return this.getPropertyValue('float');
  },
  enumerable: true,
  configurable: true,
};
