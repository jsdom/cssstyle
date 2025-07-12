"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  }
  const values = parsers.splitValue(v, {
    delimiter: ","
  });
  const keyX = ["left", "right"];
  const keyY = ["top", "bottom"];
  const keywordsX = ["center", ...keyX];
  const keywordsY = ["center", ...keyY];
  const keywords = ["center", ...keyX, ...keyY];
  const parsedValues = [];
  for (const value of values) {
    const parts = parsers.splitValue(value);
    if (!parts.length || parts.length > 4) {
      return;
    }
    let parsedValue = "";
    switch (parts.length) {
      case 1: {
        const [part] = parts;
        const val = parsers.parseMeasurement(part) || parsers.parseKeyword(part, keywords);
        if (val) {
          if (val === "center") {
            parsedValue = `${val} ${val}`;
          } else if (val === "top" || val === "bottom") {
            parsedValue = `center ${val}`;
          } else {
            parsedValue = `${val} center`;
          }
        }
        break;
      }
      case 2: {
        const [part1, part2] = parts;
        const val1 = parsers.parseMeasurement(part1) || parsers.parseKeyword(part1, keywords);
        const val2 = parsers.parseMeasurement(part2) || parsers.parseKeyword(part2, keywords);
        if (val1 && val2) {
          if (keywordsY.includes(val1) && keywordsX.includes(val2)) {
            parsedValue = `${val2} ${val1}`;
          } else if (keywordsX.includes(val1)) {
            if (val2 === "center" || !keywordsX.includes(val2)) {
              parsedValue = `${val1} ${val2}`;
            }
          } else if (keywordsY.includes(val2)) {
            if (!keywordsY.includes(val1)) {
              parsedValue = `${val1} ${val2}`;
            }
          } else if (!keywordsY.includes(val1) && !keywordsX.includes(val2)) {
            parsedValue = `${val1} ${val2}`;
          }
        }
        break;
      }
      case 3: {
        const [part1, part2, part3] = parts;
        const val1 = parsers.parseKeyword(part1, keywords);
        const val2 = parsers.parseMeasurement(part2) || parsers.parseKeyword(part2, keywords);
        const val3 = parsers.parseMeasurement(part3) || parsers.parseKeyword(part3, keywords);
        if (val1 && val2 && val3) {
          let posX = "";
          let offX = "";
          let posY = "";
          let offY = "";
          if (keywordsX.includes(val1)) {
            if (keyY.includes(val2)) {
              if (!keywords.includes(val3)) {
                posX = val1;
                posY = val2;
                offY = val3;
              }
            } else if (keyY.includes(val3)) {
              if (!keywords.includes(val2)) {
                posX = val1;
                offX = val2;
                posY = val3;
              }
            }
          } else if (keywordsY.includes(val1)) {
            if (keyX.includes(val2)) {
              if (!keywords.includes(val3)) {
                posX = val2;
                offX = val3;
                posY = val1;
              }
            } else if (keyX.includes(val3)) {
              if (!keywords.includes(val2)) {
                posX = val3;
                posY = val1;
                offY = val2;
              }
            }
          }
          if (posX && posY) {
            if (offX) {
              parsedValue = `${posX} ${offX} ${posY}`;
            } else if (offY) {
              parsedValue = `${posX} ${posY} ${offY}`;
            }
          }
        }
        break;
      }
      case 4:
      default: {
        const [part1, part2, part3, part4] = parts;
        const val1 = parsers.parseKeyword(part1, keywords);
        const val2 = parsers.parseMeasurement(part2);
        const val3 = parsers.parseKeyword(part3, keywords);
        const val4 = parsers.parseMeasurement(part4);
        if (val1 && val2 && val3 && val4) {
          let posX = "";
          let offX = "";
          let posY = "";
          let offY = "";
          if (keywordsX.includes(val1) && keyY.includes(val3)) {
            posX = val1;
            offX = val2;
            posY = val3;
            offY = val4;
          } else if (keyX.includes(val1) && keywordsY.includes(val3)) {
            posX = val1;
            offX = val2;
            posY = val3;
            offY = val4;
          } else if (keyY.includes(val1) && keywordsX.includes(val3)) {
            posX = val3;
            offX = val4;
            posY = val1;
            offY = val2;
          }
          if (posX && offX && posY && offY) {
            parsedValue = `${posX} ${offX} ${posY} ${offY}`;
          }
        }
      }
    }
    if (parsedValue) {
      parsedValues.push(parsedValue);
    } else {
      return;
    }
  }
  if (parsedValues.length) {
    return parsedValues.join(", ");
  }
};

module.exports.isValid = function isValid(v) {
  if (v === "") {
    return true;
  }
  return typeof module.exports.parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    if (parsers.hasVarFunc(v)) {
      this._setProperty("background", "");
      this._setProperty("background-position", v);
    } else {
      this._setProperty("background-position", module.exports.parse(v));
    }
  },
  get() {
    return this.getPropertyValue("background-position");
  },
  enumerable: true,
  configurable: true
};
