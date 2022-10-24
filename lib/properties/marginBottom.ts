import * as margin from './margin';
import { subImplicitSetter } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: subImplicitSetter('margin', 'bottom', margin.isValid, margin.parser),
  get: function () {
    return this.getPropertyValue('margin-bottom');
  },
  enumerable: true,
  configurable: true,
};
