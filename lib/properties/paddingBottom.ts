import * as padding from './padding';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
import { subImplicitSetter } from '../parsers';

export const definition: BasicPropertyDescriptor = {
  set: subImplicitSetter('padding', 'bottom', padding.isValid, padding.parser),
  get: function () {
    return this.getPropertyValue('padding-bottom');
  },
  enumerable: true,
  configurable: true,
};
