import * as padding from './padding';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
import { subImplicitSetter } from '../parsers';

export const definition: BasicPropertyDescriptor = {
  set: subImplicitSetter('padding', 'top', padding.isValid, padding.parser),
  get: function () {
    return this.getPropertyValue('padding-top');
  },
  enumerable: true,
  configurable: true,
};
