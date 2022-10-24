import * as margin from './margin';
import { subImplicitSetter } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: subImplicitSetter('margin', 'top', margin.isValid, margin.parser),
  get: function () {
    return this.getPropertyValue('margin-top');
  },
  enumerable: true,
  configurable: true,
};
