import { isValid } from './borderStyle';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
export { isValid };

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    if (isValid(v)) {
      if (v.toLowerCase() === 'none') {
        v = '';
        this.removeProperty('border-left-width');
      }
      this._setProperty('border-left-style', v);
    }
  },
  get: function () {
    return this.getPropertyValue('border-left-style');
  },
  enumerable: true,
  configurable: true,
};
