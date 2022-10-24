import { CSSStyleDeclaration } from '../CSSStyleDeclaration';

export interface BasicPropertyDescriptor {
  readonly set: (this: CSSStyleDeclaration, value: unknown) => void;
  readonly get: (this: CSSStyleDeclaration) => string;
  readonly enumerable: boolean;
  readonly configurable: boolean;
}

export function getBasicPropertyDescriptor(name: string): BasicPropertyDescriptor {
  return {
    set: function (v) {
      this._setProperty(name, v);
    },
    get: function () {
      return this.getPropertyValue(name);
    },
    enumerable: true,
    configurable: true,
  };
}
