import * as backgroundColor from './backgroundColor';
import * as backgroundImage from './backgroundImage';
import * as backgroundRepeat from './backgroundRepeat';
import * as backgroundAttachment from './backgroundAttachment';
import * as backgroundPosition from './backgroundPosition';
import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';
import { shorthandGetter, shorthandSetter } from '../parsers';

const shorthand_for = {
  'background-color': backgroundColor,
  'background-image': backgroundImage,
  'background-repeat': backgroundRepeat,
  'background-attachment': backgroundAttachment,
  'background-position': backgroundPosition,
};

export const definition: BasicPropertyDescriptor = {
  set: shorthandSetter('background', shorthand_for),
  get: shorthandGetter('background', shorthand_for),
  enumerable: true,
  configurable: true,
};
