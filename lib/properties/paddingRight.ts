import * as padding from './padding';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
import { subImplicitSetter } from '../parsers';

export const definition: BasicPropertyDescriptor = {
  set: subImplicitSetter('padding', 'right', padding.isValid, padding.parser),
  get: function () {
    return this.getPropertyValue('padding-right');
  },
  enumerable: true,
  configurable: true,
};
