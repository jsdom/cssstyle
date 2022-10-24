import { isValid } from './borderColor';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
export { isValid };

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    if (isValid(v)) {
      this._setProperty('border-top-color', v);
    }
  },
  get: function () {
    return this.getPropertyValue('border-top-color');
  },
  enumerable: true,
  configurable: true,
};
