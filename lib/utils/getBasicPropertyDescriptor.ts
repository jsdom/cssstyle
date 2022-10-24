export interface BasicPropertyDescriptorThis extends Record<PropertyKey, unknown> {
  readonly _setProperty: (name: string, value: unknown) => void;
  readonly setProperty: (name: string, value: unknown) => void;
  readonly getPropertyValue: (name: string) => string;
  readonly removeProperty: (property: string) => void;
  readonly _values: Record<string, unknown>;
}

export interface BasicPropertyDescriptor {
  readonly set: (this: BasicPropertyDescriptorThis, value: unknown) => void;
  readonly get: (this: BasicPropertyDescriptorThis) => string;
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
