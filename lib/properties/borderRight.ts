import * as borderRightWidth from './borderRightWidth';
import * as borderRightStyle from './borderRightStyle';
import * as borderRightColor from './borderRightColor';
import { shorthandGetter, shorthandSetter } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const shorthand_for = {
  'border-right-width': borderRightWidth,
  'border-right-style': borderRightStyle,
  'border-right-color': borderRightColor,
};

export const definition: BasicPropertyDescriptor = {
  set: shorthandSetter('border-right', shorthand_for),
  get: shorthandGetter('border-right', shorthand_for),
  enumerable: true,
  configurable: true,
};
