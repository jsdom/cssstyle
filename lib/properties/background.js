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

module.exports.shorthandFor = new Map([
  ["background-image", backgroundImage],
  ["background-position", backgroundPosition],
  ["background-size", backgroundSize],
  ["background-repeat", backgroundRepeat],
  ["background-origin", backgroundOrigin],
  ["background-clip", backgroundClip],
  ["background-attachment", backgroundAttachment],
  ["background-color", backgroundColor]
]);

const initialValues = new Map([
  ["background-image", "none"],
  ["background-position", "0% 0%"],
  ["background-size", "auto"],
  ["background-repeat", "repeat"],
  ["background-origin", "padding-box"],
  ["background-clip", "border-box"],
  ["background-attachment", "scroll"],
  ["background-color", "transparent"]
]);

module.exports.parse = function parse(v) {
  const values = parsers.splitValue(v, {
    delimiter: ","
  });
  const bgValues = [];
  const l = values.length;
  for (let i = 0; i < l; i++) {
    let bg = {
      "background-image": initialValues.get("background-image"),
      "background-position": initialValues.get("background-position"),
      "background-size": initialValues.get("background-size"),
      "background-repeat": initialValues.get("background-repeat"),
      "background-origin": initialValues.get("background-origin"),
      "background-clip": initialValues.get("background-clip"),
      "background-attachment": initialValues.get("background-attachment"),
      "background-color": initialValues.get("background-color")
    };
    if (l > 1 && i !== l - 1) {
      bg = {
        "background-image": initialValues.get("background-image"),
        "background-position": initialValues.get("background-position"),
        "background-size": initialValues.get("background-size"),
        "background-repeat": initialValues.get("background-repeat"),
        "background-origin": initialValues.get("background-origin"),
        "background-clip": initialValues.get("background-clip"),
        "background-attachment": initialValues.get("background-attachment")
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
      for (const [property, value] of module.exports.shorthandFor) {
        if (value.isValid(part)) {
          partValid = true;
          switch (property) {
            case "background-clip":
            case "background-origin": {
              const parsedValue = value.parse(part);
              if (parsedValue) {
                bgBox.push(parsedValue);
              }
              break;
            }
            case "background-color": {
              if (i !== values.length - 1) {
                return;
              }
              const parsedValue = value.parse(part);
              if (parsedValue) {
                bg[property] = parsedValue;
              }
              break;
            }
            case "background-position": {
              const parsedValue = value.parse(part);
              if (parsedValue) {
                bgPosition.push(parsedValue);
              }
              break;
            }
            case "background-repeat": {
              const parsedValue = value.parse(part);
              if (parsedValue) {
                bgRepeat.push(parsedValue);
              }
              break;
            }
            case "background-size": {
              break;
            }
            default: {
              const parsedValue = value.parse(part);
              if (parsedValue) {
                bg[property] = parsedValue;
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
        for (const [property, value] of module.exports.shorthandFor) {
          if (value.isValid(part)) {
            partValid = true;
            switch (property) {
              case "background-clip":
              case "background-origin": {
                const parsedValue = value.parse(part);
                if (parsedValue) {
                  bgBox.push(parsedValue);
                }
                break;
              }
              case "background-color": {
                if (i !== l - 1) {
                  return;
                }
                const parsedValue = value.parse(part);
                if (parsedValue) {
                  bg[property] = parsedValue;
                }
                break;
              }
              case "background-position": {
                break;
              }
              case "background-repeat": {
                const parsedValue = value.parse(part);
                if (parsedValue) {
                  bgRepeat.push(parsedValue);
                }
                break;
              }
              case "background-size": {
                const parsedValue = value.parse(part);
                if (parsedValue) {
                  bgSize.push(parsedValue);
                }
                break;
              }
              default: {
                const parsedValue = value.parse(part);
                if (parsedValue) {
                  bg[property] = parsedValue;
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
      const { parse: parser } = module.exports.shorthandFor.get("background-position");
      const value = parser(bgPosition.join(" "));
      if (value) {
        bg["background-position"] = value;
      }
    }
    if (bgSize.length) {
      const { parse: parser } = module.exports.shorthandFor.get("background-size");
      const value = parser(bgSize.join(" "));
      if (value) {
        bg["background-size"] = value;
      }
    }
    if (bgRepeat.length) {
      const { parse: parser } = module.exports.shorthandFor.get("background-repeat");
      const value = parser(bgRepeat.join(" "));
      if (value) {
        bg["background-repeat"] = value;
      }
    }
    if (bgBox.length) {
      switch (bgBox.length) {
        case 1: {
          const [value] = bgBox;
          bg["background-origin"] = value;
          bg["background-clip"] = value;
          break;
        }
        case 2: {
          const [value1, value2] = bgBox;
          bg["background-origin"] = value1;
          bg["background-clip"] = value2;
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
    if (v === "" || parsers.hasVarFunc(v)) {
      for (const [key] of module.exports.shorthandFor) {
        this._setProperty(key, "");
      }
      this._setProperty("background", v);
    } else {
      const bgValues = module.exports.parse(v);
      if (!Array.isArray(bgValues)) {
        return;
      }
      const bgMap = new Map([
        ["background-image", []],
        ["background-position", []],
        ["background-size", []],
        ["background-repeat", []],
        ["background-origin", []],
        ["background-clip", []],
        ["background-attachment", []],
        ["background-color", []]
      ]);
      const backgrounds = [];
      for (const bgValue of bgValues) {
        const bg = [];
        for (const [property, value] of Object.entries(bgValue)) {
          if (value) {
            const arr = bgMap.get(property);
            arr.push(value);
            bgMap.set(property, arr);
            if (value !== initialValues.get(property)) {
              if (property === "background-size") {
                bg.push(`/ ${value}`);
              } else {
                bg.push(value);
              }
            } else if (property === "background-image") {
              if (v === "none") {
                bg.push(value);
              }
            } else if (property === "background-color") {
              if (v === "transparent") {
                bg.push(value);
              }
            }
          }
        }
        backgrounds.push(bg.join(" "));
      }
      for (const [property, value] of bgMap) {
        this._setProperty(property, value.join(", "));
      }
      this._setProperty("background", backgrounds.join(", "));
    }
  },
  get() {
    const v = this.getPropertyValue("background");
    if (parsers.hasVarFunc(v)) {
      return v;
    }
    const bgMap = new Map();
    let l = 0;
    for (const [property] of module.exports.shorthandFor) {
      const val = this.getPropertyValue(property);
      if (property === "background-image") {
        if (
          val === "none" &&
          v === "none" &&
          this.getPropertyValue("background-color") === "transparent"
        ) {
          return val;
        }
        if (val !== initialValues.get(property)) {
          const imgValues = parsers.splitValue(val, {
            delimiter: ","
          });
          l = imgValues.length;
          bgMap.set(property, imgValues);
        }
      } else if (property === "background-color") {
        if (val !== initialValues.get(property) || v.includes(val)) {
          bgMap.set(property, [val]);
        }
      } else if (val !== initialValues.get(property)) {
        bgMap.set(
          property,
          parsers.splitValue(val, {
            delimiter: ","
          })
        );
      }
    }
    if (l === 0) {
      const [background] = bgMap.get("background-color");
      if (background) {
        return background;
      }
      return "";
    }
    const bgValues = [];
    for (let i = 0; i < l; i++) {
      bgValues[i] = [];
    }
    for (const [property, values] of bgMap) {
      for (let i = 0; i < l; i++) {
        switch (property) {
          case "background-color": {
            if (i === l - 1) {
              const value = values[0];
              if (parsers.hasVarFunc(value)) {
                return "";
              }
              if (value && value !== initialValues.get(property)) {
                const bgValue = bgValues[i];
                bgValue.push(value);
              }
            }
            break;
          }
          case "background-size": {
            const value = values[i];
            if (parsers.hasVarFunc(value)) {
              return "";
            }
            if (value && value !== initialValues.get(property)) {
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
            if (value && value !== initialValues.get(property)) {
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
