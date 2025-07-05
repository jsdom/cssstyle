"use strict";

const parsers = require("../parsers");

module.exports.parse = function parse(v) {
  const parts = parsers.splitValue(v);
  if (!parts.length || parts.length > 4) {
    return;
  }
  const keyX = ["left", "right"];
  const keyY = ["top", "bottom"];
  const keywordsX = ["center", ...keyX];
  const keywordsY = ["center", ...keyY];
  const validKeywords = ["center", ...keyX, ...keyY];
  switch (parts.length) {
    case 1: {
      const dim = parsers.parseMeasurement(parts[0]);
      if (dim) {
        return dim;
      }
      return parsers.parseKeyword(v, validKeywords);
    }
    case 2: {
      const [part1, part2] = parts;
      const val1 = parsers.parseMeasurement(part1) || parsers.parseKeyword(part1, validKeywords);
      const val2 = parsers.parseMeasurement(part2) || parsers.parseKeyword(part2, validKeywords);
      if (val1 && val2) {
        if (keywordsY.includes(val1) && keywordsX.includes(val2)) {
          return `${val2} ${val1}`;
        }
        if (keywordsX.includes(val1)) {
          if (val2 === "center" || !keywordsX.includes(val2)) {
            return `${val1} ${val2}`;
          }
        } else if (keywordsY.includes(val2)) {
          if (!keywordsY.includes(val1)) {
            return `${val1} ${val2}`;
          }
        } else if (!keywordsY.includes(val1) && !keywordsX.includes(val2)) {
          return `${val1} ${val2}`;
        }
      }
      break;
    }
    case 3: {
      const [part1, part2, part3] = parts;
      const val1 = parsers.parseKeyword(part1, validKeywords);
      const val2 = parsers.parseMeasurement(part2) || parsers.parseKeyword(part2, validKeywords);
      const val3 = parsers.parseMeasurement(part3) || parsers.parseKeyword(part3, validKeywords);
      if (val1 && val2 && val3) {
        let posX = "";
        let offX = "";
        let posY = "";
        let offY = "";
        if (keywordsX.includes(val1)) {
          if (keywordsY.includes(val2)) {
            if (!validKeywords.includes(val3)) {
              posX = val1;
              posY = val2;
              offY = val3;
            }
          } else if (keywordsY.includes(val3)) {
            if (!validKeywords.includes(val2)) {
              posX = val1;
              offX = val2;
              posY = val3;
            }
          }
        } else if (keywordsY.includes(val1)) {
          if (keywordsX.includes(val2)) {
            if (!validKeywords.includes(val3)) {
              posX = val2;
              offX = val3;
              posY = val1;
            }
          } else if (keywordsX.includes(val3)) {
            if (!validKeywords.includes(val2)) {
              posX = val3;
              posY = val1;
              offY = val2;
            }
          }
        }
        if (posX && posY) {
          if (offX) {
            return `${posX} ${offX} ${posY}`;
          }
          if (offY) {
            return `${posX} ${posY} ${offY}`;
          }
        }
      }
      break;
    }
    case 4:
    default: {
      const [part1, part2, part3, part4] = parts;
      const val1 = parsers.parseKeyword(part1, validKeywords);
      const val2 = parsers.parseMeasurement(part2);
      const val3 = parsers.parseKeyword(part3, validKeywords);
      const val4 = parsers.parseMeasurement(part4);
      if (val1 && val2 && val3 && val4) {
        let posX = "";
        let offX = "";
        let posY = "";
        let offY = "";
        if (keywordsX.includes(val1) && keywordsY.includes(val3)) {
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
          return `${posX} ${offX} ${posY} ${offY}`;
        }
      }
    }
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
