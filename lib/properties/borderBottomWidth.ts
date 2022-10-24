import { isValid } from './borderWidth';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
export { isValid };

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    if (isValid(v)) {
      this._setProperty('border-bottom-width', v);
    }
  },
  get: function () {
    return this.getPropertyValue('border-bottom-width');
  },
  enumerable: true,
  configurable: true,
};
