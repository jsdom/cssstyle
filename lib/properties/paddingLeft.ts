import * as padding from './padding';
import { subImplicitSetter } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: subImplicitSetter('padding', 'left', padding.isValid, padding.parser),
  get: function () {
    return this.getPropertyValue('padding-left');
  },
  enumerable: true,
  configurable: true,
};
