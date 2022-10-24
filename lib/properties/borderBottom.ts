import * as borderBottomWidth from './borderBottomWidth';
import * as borderBottomStyle from './borderBottomStyle';
import * as borderBottomColor from './borderBottomColor';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
import { shorthandGetter, shorthandSetter } from '../parsers';

const shorthand_for = {
  'border-bottom-width': borderBottomWidth,
  'border-bottom-style': borderBottomStyle,
  'border-bottom-color': borderBottomColor,
};

export const definition: BasicPropertyDescriptor = {
  set: shorthandSetter('border-bottom', shorthand_for),
  get: shorthandGetter('border-bottom', shorthand_for),
  enumerable: true,
  configurable: true,
};
