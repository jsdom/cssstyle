"use strict";

const parsers = require("../parsers");
const backgroundImage = require("./backgroundImage");
const backgroundPosition = require("./backgroundPosition");
const backgroundSize = require("./backgroundSize");
const backgroundRepeat = require("./backgroundRepeat");
const backgroundOrigin = require("./backgroundOrigin");
const backgroundClip = require("./backgroundClip");
const backgroundAttachment = require("./backgroundAttachment");
const backgroundColor = require("./backgroundColor");

const PROPERTY = "background";
const BG_ATTACH = "background-attachment";
const BG_CLIP = "background-clip";
const BG_COLOR = "background-color";
const BG_IMAGE = "background-image";
const BG_ORIGIN = "background-origin";
const BG_POSITION = "background-position";
const BG_REPEAT = "background-repeat";
const BG_SIZE = "background-size";

module.exports.initialValues = new Map([
  [BG_IMAGE, "none"],
  [BG_POSITION, "0% 0%"],
  [BG_SIZE, "auto"],
  [BG_REPEAT, "repeat"],
  [BG_ORIGIN, "padding-box"],
  [BG_CLIP, "border-box"],
  [BG_ATTACH, "scroll"],
  [BG_COLOR, "transparent"]
]);

module.exports.shorthandFor = new Map([
  [BG_IMAGE, backgroundImage],
  [BG_POSITION, backgroundPosition],
  [BG_SIZE, backgroundSize],
  [BG_REPEAT, backgroundRepeat],
  [BG_ORIGIN, backgroundOrigin],
  [BG_CLIP, backgroundClip],
  [BG_ATTACH, backgroundAttachment],
  [BG_COLOR, backgroundColor]
]);

module.exports.parse = function parse(v, opt = {}) {
  const { globalObject, options } = opt;
  if (v === "") {
    return v;
  } else if (parsers.hasCalcFunc(v)) {
    v = parsers.resolveCalc(v, opt);
  }
  if (!parsers.isValidPropertyValue(PROPERTY, v, globalObject)) {
    return;
  }
  const values = parsers.splitValue(v, {
    delimiter: ","
  });
  const bgValues = [];
  const l = values.length;
  for (let i = 0; i < l; i++) {
    let bg = {
      [BG_IMAGE]: module.exports.initialValues.get(BG_IMAGE),
      [BG_POSITION]: module.exports.initialValues.get(BG_POSITION),
      [BG_SIZE]: module.exports.initialValues.get(BG_SIZE),
      [BG_REPEAT]: module.exports.initialValues.get(BG_REPEAT),
      [BG_ORIGIN]: module.exports.initialValues.get(BG_ORIGIN),
      [BG_CLIP]: module.exports.initialValues.get(BG_CLIP),
      [BG_ATTACH]: module.exports.initialValues.get(BG_ATTACH),
      [BG_COLOR]: module.exports.initialValues.get(BG_COLOR)
    };
    if (l > 1 && i !== l - 1) {
      bg = {
        [BG_IMAGE]: module.exports.initialValues.get(BG_IMAGE),
        [BG_POSITION]: module.exports.initialValues.get(BG_POSITION),
        [BG_SIZE]: module.exports.initialValues.get(BG_SIZE),
        [BG_REPEAT]: module.exports.initialValues.get(BG_REPEAT),
        [BG_ORIGIN]: module.exports.initialValues.get(BG_ORIGIN),
        [BG_CLIP]: module.exports.initialValues.get(BG_CLIP),
        [BG_ATTACH]: module.exports.initialValues.get(BG_ATTACH)
      };
    }
    const bgPosition = [];
    const bgSize = [];
    const bgRepeat = [];
    const bgBox = [];
    const bgParts = parsers.splitValue(values[i], {
      delimiter: "/"
    });
    if (!bgParts.length || bgParts.length > 2) {
      return;
    }
    const [bgPart1, bgPart2 = ""] = bgParts;
    const parts1 = parsers.splitValue(bgPart1);
    for (const part of parts1) {
      let partValid = false;
      for (const [longhand, value] of module.exports.shorthandFor) {
        if (parsers.isValidPropertyValue(longhand, part, globalObject)) {
          partValid = true;
          switch (longhand) {
            case BG_CLIP:
            case BG_ORIGIN: {
              const parsedValue = value.parse(part, { globalObject, options });
              if (parsedValue) {
                bgBox.push(parsedValue);
              }
              break;
            }
            case BG_COLOR: {
              if (i !== values.length - 1) {
                return;
              }
              const parsedValue = value.parse(part, { globalObject, options });
              if (parsedValue) {
                bg[longhand] = parsedValue;
              }
              break;
            }
            case BG_POSITION: {
              bgPosition.push(part);
              break;
            }
            case BG_REPEAT: {
              bgRepeat.push(part);
              break;
            }
            case BG_SIZE: {
              break;
            }
            default: {
              const parsedValue = value.parse(part, { globalObject, options });
              if (parsedValue) {
                bg[longhand] = parsedValue;
              }
            }
          }
        }
      }
      if (!partValid) {
        return;
      }
    }
    if (bgPart2) {
      const parts2 = parsers.splitValue(bgPart2);
      for (const part of parts2) {
        let partValid = false;
        for (const [longhand, value] of module.exports.shorthandFor) {
          if (parsers.isValidPropertyValue(longhand, part, globalObject)) {
            partValid = true;
            switch (longhand) {
              case BG_CLIP:
              case BG_ORIGIN: {
                const parsedValue = value.parse(part, { globalObject, options });
                if (parsedValue) {
                  bgBox.push(parsedValue);
                }
                break;
              }
              case BG_COLOR: {
                if (i !== l - 1) {
                  return;
                }
                const parsedValue = value.parse(part, { globalObject, options });
                if (parsedValue) {
                  bg[longhand] = parsedValue;
                }
                break;
              }
              case BG_POSITION: {
                break;
              }
              case BG_REPEAT: {
                bgRepeat.push(part);
                break;
              }
              case BG_SIZE: {
                bgSize.push(part);
                break;
              }
              default: {
                const parsedValue = value.parse(part, { globalObject, options });
                if (parsedValue) {
                  bg[longhand] = parsedValue;
                }
              }
            }
          }
        }
        if (!partValid) {
          return;
        }
      }
    }
    if (bgPosition.length) {
      const { parse: parser } = module.exports.shorthandFor.get(BG_POSITION);
      const value = parser(bgPosition.join(" "), { globalObject, options });
      if (value) {
        bg[BG_POSITION] = value;
      }
    }
    if (bgSize.length) {
      const { parse: parser } = module.exports.shorthandFor.get(BG_SIZE);
      const value = parser(bgSize.join(" "), { globalObject, options });
      if (value) {
        bg[BG_SIZE] = value;
      }
    }
    if (bgRepeat.length) {
      const { parse: parser } = module.exports.shorthandFor.get(BG_REPEAT);
      const value = parser(bgRepeat.join(" "), { globalObject, options });
      if (value) {
        bg[BG_REPEAT] = value;
      }
    }
    if (bgBox.length) {
      switch (bgBox.length) {
        case 1: {
          const [value] = bgBox;
          bg[BG_ORIGIN] = value;
          bg[BG_CLIP] = value;
          break;
        }
        case 2: {
          const [value1, value2] = bgBox;
          bg[BG_ORIGIN] = value1;
          bg[BG_CLIP] = value2;
          break;
        }
        default: {
          return;
        }
      }
    }
    bgValues.push(bg);
  }
  return bgValues;
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    // The value has already been set.
    if (this._values.get(PROPERTY) === v && !this._priorities.get(PROPERTY)) {
      return;
    }
    if (v === "" || parsers.hasVarFunc(v)) {
      for (const [key] of module.exports.shorthandFor) {
        this._setProperty(key, "");
      }
      this._setProperty(PROPERTY, v);
    } else {
      const bgValues = module.exports.parse(v, {
        globalObject: this._global,
        options: this._options
      });
      if (!Array.isArray(bgValues)) {
        return;
      }
      const bgMap = new Map([
        [BG_IMAGE, []],
        [BG_POSITION, []],
        [BG_SIZE, []],
        [BG_REPEAT, []],
        [BG_ORIGIN, []],
        [BG_CLIP, []],
        [BG_ATTACH, []],
        [BG_COLOR, []]
      ]);
      const backgrounds = [];
      for (const bgValue of bgValues) {
        const bg = [];
        for (const [longhand, value] of Object.entries(bgValue)) {
          if (value) {
            const arr = bgMap.get(longhand);
            arr.push(value);
            bgMap.set(longhand, arr);
            if (value !== module.exports.initialValues.get(longhand)) {
              if (longhand === BG_SIZE) {
                bg.push(`/ ${value}`);
              } else {
                bg.push(value);
              }
            } else if (longhand === BG_IMAGE) {
              if (v === "none") {
                bg.push(value);
              }
            } else if (longhand === BG_COLOR) {
              if (v === "transparent") {
                bg.push(value);
              }
            }
          }
        }
        backgrounds.push(bg.join(" "));
      }
      const priority = this._priorities.get(PROPERTY) ?? "";
      for (const [longhand, value] of bgMap) {
        this._setProperty(longhand, value.join(", "), priority);
      }
      this._setProperty(PROPERTY, backgrounds.join(", "), priority);
    }
  },
  get() {
    const v = this.getPropertyValue(PROPERTY);
    if (parsers.hasVarFunc(v)) {
      return v;
    }
    const bgMap = new Map();
    let l = 0;
    for (const [longhand] of module.exports.shorthandFor) {
      const val = this.getPropertyValue(longhand);
      if (longhand === BG_IMAGE) {
        if (val === "none" && v === "none" && this.getPropertyValue(BG_COLOR) === "transparent") {
          return val;
        }
        if (val !== module.exports.initialValues.get(longhand)) {
          const imgValues = parsers.splitValue(val, {
            delimiter: ","
          });
          l = imgValues.length;
          bgMap.set(longhand, imgValues);
        }
      } else if (longhand === BG_COLOR) {
        if (val !== module.exports.initialValues.get(longhand) || v.includes(val)) {
          bgMap.set(longhand, [val]);
        }
      } else if (val !== module.exports.initialValues.get(longhand)) {
        bgMap.set(
          longhand,
          parsers.splitValue(val, {
            delimiter: ","
          })
        );
      }
    }
    // No background-image
    if (l === 0) {
      if (bgMap.size) {
        const bgValue = [];
        for (const [longhand, values] of bgMap) {
          switch (longhand) {
            case BG_COLOR: {
              const [value] = values;
              if (parsers.hasVarFunc(value)) {
                return "";
              }
              bgValue.push(value);
              break;
            }
            case BG_SIZE: {
              const [value] = values;
              if (parsers.hasVarFunc(value)) {
                return "";
              }
              if (value && value !== module.exports.initialValues.get(longhand)) {
                bgValue.push(`/ ${value}`);
              }
              break;
            }
            default: {
              const [value] = values;
              if (parsers.hasVarFunc(value)) {
                return "";
              }
              if (value && value !== module.exports.initialValues.get(longhand)) {
                bgValue.push(value);
              }
            }
          }
        }
        return bgValue.join(" ");
      }
      return "";
    }
    const bgValues = [];
    for (let i = 0; i < l; i++) {
      bgValues[i] = [];
    }
    for (const [longhand, values] of bgMap) {
      for (let i = 0; i < l; i++) {
        switch (longhand) {
          case BG_COLOR: {
            if (i === l - 1) {
              const value = values[0];
              if (parsers.hasVarFunc(value)) {
                return "";
              }
              if (value && value !== module.exports.initialValues.get(longhand)) {
                const bgValue = bgValues[i];
                bgValue.push(value);
              }
            }
            break;
          }
          case BG_SIZE: {
            const value = values[i];
            if (parsers.hasVarFunc(value)) {
              return "";
            }
            if (value && value !== module.exports.initialValues.get(longhand)) {
              const bgValue = bgValues[i];
              bgValue.push(`/ ${value}`);
            }
            break;
          }
          default: {
            const value = values[i];
            if (parsers.hasVarFunc(value)) {
              return "";
            }
            if (value && value !== module.exports.initialValues.get(longhand)) {
              const bgValue = bgValues[i];
              bgValue.push(value);
            }
          }
        }
      }
    }
    const backgrounds = [];
    for (const bgValue of bgValues) {
      backgrounds.push(bgValue.join(" "));
    }
    return backgrounds.join(", ");
  },
  enumerable: true,
  configurable: true
};
