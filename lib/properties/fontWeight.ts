import { BasicPropertyDescriptor } from '../utils/getBasicPropertyDescriptor';

const valid_weights = [
  'normal',
  'bold',
  'bolder',
  'lighter',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  'inherit',
];

export function isValid(v: string): boolean {
  return valid_weights.indexOf(v.toLowerCase()) !== -1;
}

export const definition: BasicPropertyDescriptor = {
  set: function (v) {
    this._setProperty('font-weight', v);
  },
  get: function () {
    return this.getPropertyValue('font-weight');
  },
  enumerable: true,
  configurable: true,
};
