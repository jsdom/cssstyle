import { subImplicitSetter } from '../parsers';
import * as margin from './margin';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

export const definition: BasicPropertyDescriptor = {
  set: subImplicitSetter('margin', 'right', margin.isValid, margin.parser),
  get: function () {
    return this.getPropertyValue('margin-right');
  },
  enumerable: true,
  configurable: true,
};
