import * as margin from './margin';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
import { subImplicitSetter } from '../parsers';

export const definition: BasicPropertyDescriptor = {
  set: subImplicitSetter('margin', 'left', margin.isValid, margin.parser),
  get: function () {
    return this.getPropertyValue('margin-left');
  },
  enumerable: true,
  configurable: true,
};
