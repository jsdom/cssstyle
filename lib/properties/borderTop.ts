import * as borderTopWidth from './borderTopWidth';
import * as borderTopStyle from './borderTopStyle';
import * as borderTopColor from './borderTopColor';
import { shorthandGetter, shorthandSetter } from '../parsers';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const shorthand_for = {
  'border-top-width': borderTopWidth,
  'border-top-style': borderTopStyle,
  'border-top-color': borderTopColor,
};

export const definition: BasicPropertyDescriptor = {
  set: shorthandSetter('border-top', shorthand_for),
  get: shorthandGetter('border-top', shorthand_for),
  enumerable: true,
  configurable: true,
};
