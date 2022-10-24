import * as borderLeftWidth from './borderLeftWidth';
import * as borderLeftStyle from './borderLeftStyle';
import * as borderLeftColor from './borderLeftColor';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
import { shorthandGetter, shorthandSetter } from '../parsers';

const shorthand_for = {
  'border-left-width': borderLeftWidth,
  'border-left-style': borderLeftStyle,
  'border-left-color': borderLeftColor,
};

export const definition: BasicPropertyDescriptor = {
  set: shorthandSetter('border-left', shorthand_for),
  get: shorthandGetter('border-left', shorthand_for),
  enumerable: true,
  configurable: true,
};
