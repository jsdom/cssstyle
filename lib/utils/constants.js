"use strict";

// CSS calc() function names
exports.CALC_FUNC_NAMES =
  "(?:a?(?:cos|sin|tan)|abs|atan2|calc|clamp|exp|hypot|log|max|min|mod|pow|rem|round|sign|sqrt)";

// Node.ELEMENT_NODE
exports.ELEMENT_NODE = 1;

// CSS global keywords
// @see https://drafts.csswg.org/css-cascade-5/#defaulting-keywords
exports.GLOBAL_KEY = Object.freeze(["initial", "inherit", "unset", "revert", "revert-layer"]);

// AST Node types
exports.NODE_TYPES = Object.freeze({
  DIMENSION: "Dimension",
  FUNCTION: "Function",
  HASH: "Hash",
  IDENTIFIER: "Identifier",
  NUMBER: "Number",
  PERCENTAGE: "Percentage",
  STRING: "String",
  URL: "Url"
});

// NoModificationAllowedError name
exports.NO_MODIFICATION_ALLOWED_ERR = "NoModificationAllowedError";

// System colors
// @see https://drafts.csswg.org/css-color/#css-system-colors
// @see https://drafts.csswg.org/css-color/#deprecated-system-colors
exports.SYS_COLOR = Object.freeze([
  "accentcolor",
  "accentcolortext",
  "activeborder",
  "activecaption",
  "activetext",
  "appworkspace",
  "background",
  "buttonborder",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "canvas",
  "canvastext",
  "captiontext",
  "field",
  "fieldtext",
  "graytext",
  "highlight",
  "highlighttext",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infobackground",
  "infotext",
  "linktext",
  "mark",
  "marktext",
  "menu",
  "menutext",
  "scrollbar",
  "selecteditem",
  "selecteditemtext",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "visitedtext",
  "window",
  "windowframe",
  "windowtext"
]);
