import { isValid } from './borderColor';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
export { isValid };

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    if (isValid(v)) {
      this._setProperty('border-bottom-color', v);
    }
  },
  get: function () {
    return this.getPropertyValue('border-bottom-color');
  },
  enumerable: true,
  configurable: true,
};
