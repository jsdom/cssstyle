import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

import * as fontFamily from './fontFamily';
import * as fontSize from './fontSize';
import * as fontStyle from './fontStyle';
import * as fontVariant from './fontVariant';
import * as fontWeight from './fontWeight';
import * as lineHeight from './lineHeight';
import { shorthandGetter, shorthandParser, shorthandSetter, TYPES, valueType } from '../parsers';

const shorthand_for = {
  'font-family': fontFamily,
  'font-size': fontSize,
  'font-style': fontStyle,
  'font-variant': fontVariant,
  'font-weight': fontWeight,
  'line-height': lineHeight,
};

const static_fonts = [
  'caption',
  'icon',
  'menu',
  'message-box',
  'small-caption',
  'status-bar',
  'inherit',
];

const setter = shorthandSetter('font', shorthand_for);

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    const short = shorthandParser(v, shorthand_for);
    if (short !== undefined) {
      return setter.call(this, v);
    }
    const type = valueType(v);
    if (type.kind === TYPES.KEYWORD && static_fonts.indexOf(type.value.toLowerCase()) !== -1) {
      this._setProperty('font', v);
    }
  },
  get: shorthandGetter('font', shorthand_for),
  enumerable: true,
  configurable: true,
};
