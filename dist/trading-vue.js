/*!
 * TradingVue.JS - v1.0.3 - Fri Jan 24 2025
 *     https://github.com/tvjsx/trading-vue-js
 *     Copyright (c) 2019 C451 Code's All Right;
 *     Licensed under the MIT license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TradingVueJs"] = factory();
	else
		root["TradingVueJs"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 62:
/***/ ((module) => {

/**
 * Utility compare functions
 */

module.exports = {

    /**
     * Compare two numbers.
     *
     * @param {Number} a
     * @param {Number} b
     * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
     */
    numcmp: function (a, b) {
        return a - b;
    },

    /**
     * Compare two strings.
     *
     * @param {Number|String} a
     * @param {Number|String} b
     * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
     */
    strcmp: function (a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

};


/***/ }),

/***/ 74:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Indexed Array Binary Search module
 */

/**
 * Dependencies
 */
var util = __webpack_require__(396),
    cmp = __webpack_require__(62),
    bin = __webpack_require__(874);

/**
 * Module interface definition
 */
module.exports = IndexedArray;

/**
 * Indexed Array constructor
 *
 * It loads the array data, defines the index field and the comparison function
 * to be used.
 *
 * @param {Array} data is an array of objects
 * @param {String} index is the object's property used to search the array
 */
function IndexedArray(data, index) {

    // is data sortable array or array-like object?
    if (!util.isSortableArrayLike(data))
        throw new Error("Invalid data");

    // is index a valid property?
    if (!index || data.length > 0 && !(index in data[0]))
        throw new Error("Invalid index");

    // data array
    this.data = data;

    // name of the index property
    this.index = index;

    // set index boundary values
    this.setBoundaries();

    // default comparison function
    this.compare = typeof this.minv === "number" ? cmp.numcmp : cmp.strcmp;

    // default search function
    this.search = bin.search;

    // cache of index values to array positions
    // each value stores an object as { found: true|false, index: array-index }
    this.valpos = {};

    // cursor and adjacent positions
    this.cursor = null;
    this.nextlow = null;
    this.nexthigh = null;
}

/**
 * Set the comparison function
 *
 * @param {Function} fn to compare index values that returnes 1, 0, -1
 */
IndexedArray.prototype.setCompare = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.compare = fn;
    return this;
};

/**
 * Set the search function
 *
 * @param {Function} fn to search index values in the array of objects
 */
IndexedArray.prototype.setSearch = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.search = fn;
    return this;
};

/**
 * Sort the data array by its index property
 */
IndexedArray.prototype.sort = function () {
    var self = this,
        index = this.index;

    // sort the array
    this.data.sort(function (a, b) {
        return self.compare(a[index], b[index]);
    });

    // recalculate boundary values
    this.setBoundaries();

    return this;
};

/**
 * Inspect and set the boundaries of the internal data array
 */
IndexedArray.prototype.setBoundaries = function () {
    var data = this.data,
        index = this.index;

    this.minv = data.length && data[0][index];
    this.maxv = data.length && data[data.length - 1][index];

    return this;
};

/**
 * Get the position of the object corresponding to the given index
 *
 * @param {Number|String} index is the id of the requested object
 * @returns {Number} the position of the object in the array
 */
IndexedArray.prototype.fetch = function (value) {
    // check data has objects
    if (this.data.length === 0) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = null;
        return this;
    }

    // check the request is within range
    if (this.compare(value, this.minv) === -1) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = 0;
        return this;
    }
    if (this.compare(value, this.maxv) === 1) {
        this.cursor = null;
        this.nextlow = this.data.length - 1;
        this.nexthigh = null;
        return this;
    }

    var valpos = this.valpos,
        pos = valpos[value];

    // if the request is memorized, just give it back
    if (pos) {
        if (pos.found) {
            this.cursor = pos.index;
            this.nextlow = null;
            this.nexthigh = null;
        } else {
            this.cursor = null;
            this.nextlow = pos.prev;
            this.nexthigh = pos.next;
        }
        return this;
    }

    // if not, do the search
    var result = this.search.call(this, value);
    this.cursor = result.index;
    this.nextlow = result.prev;
    this.nexthigh = result.next;
    return this;
};

/**
 * Get the object corresponding to the given index
 *
 * When no value is given, the function will default to the last fetched item.
 *
 * @param {Number|String} [optional] index is the id of the requested object
 * @returns {Object} the found object or null
 */
IndexedArray.prototype.get = function (value) {
    if (value)
        this.fetch(value);

    var pos = this.cursor;
    return pos !== null ? this.data[pos] : null;
};

/**
 * Get an slice of the data array
 *
 * Boundaries have to be in order.
 *
 * @param {Number|String} begin index is the id of the requested object
 * @param {Number|String} end index is the id of the requested object
 * @returns {Object} the slice of data array or []
 */
IndexedArray.prototype.getRange = function (begin, end) {
    // check if boundaries are in order
    if (this.compare(begin, end) === 1) {
        return [];
    }

    // fetch start and default to the next index above
    this.fetch(begin);
    var start = this.cursor || this.nexthigh;

    // fetch finish and default to the next index below
    this.fetch(end);
    var finish = this.cursor || this.nextlow;

    // if any boundary is not set, return no range
    if (start === null || finish === null) {
        return [];
    }

    // return range
    return this.data.slice(start, finish + 1);
};


/***/ }),

/***/ 874:
/***/ ((module) => {

/**
 * Binary search implementation
 */

/**
 * Main search recursive function
 */
function loop(data, min, max, index, valpos) {

    // set current position as the middle point between min and max
    var curr = (max + min) >>> 1;

    // compare current index value with the one we are looking for
    var diff = this.compare(data[curr][this.index], index);

    // found?
    if (!diff) {
        return valpos[index] = {
            "found": true,
            "index": curr,
            "prev": null,
            "next": null
        };
    }

    // no more positions available?
    if (min >= max) {
        return valpos[index] = {
            "found": false,
            "index": null,
            "prev": (diff < 0) ? max : max - 1,
            "next": (diff < 0) ? max + 1 : max
        };
    }

    // continue looking for index in one of the remaining array halves
    // current position can be skept as index is not there...
    if (diff > 0)
        return loop.call(this, data, min, curr - 1, index, valpos);
    else
        return loop.call(this, data, curr + 1, max, index, valpos);
}

/**
 * Search bootstrap
 * The function has to be executed in the context of the IndexedArray object
 */
function search(index) {
    var data = this.data;
    return loop.call(this, data, 0, data.length - 1, index, this.valpos);
}

/**
 * Export search function
 */
module.exports.search = search;


/***/ }),

/***/ 396:
/***/ ((module) => {

/**
 * Utils module
 */

/**
 * Check if an object is an array-like object
 *
 * @credit Javascript: The Definitive Guide, O'Reilly, 2011
 */
function isArrayLike(o) {
    if (o &&                                 // o is not null, undefined, etc.
        typeof o === "object" &&             // o is an object
        isFinite(o.length) &&                // o.length is a finite number
        o.length >= 0 &&                     // o.length is non-negative
        o.length === Math.floor(o.length) && // o.length is an integer
        o.length < 4294967296)               // o.length < 2^32
        return true;                         // Then o is array-like
    else
        return false;                        // Otherwise it is not
}

/**
 * Check for the existence of the sort function in the object
 */
function isSortable(o) {
    if (o &&                                 // o is not null, undefined, etc.
        typeof o === "object" &&             // o is an object
        typeof o.sort === "function")        // o.sort is a function
        return true;                         // Then o is array-like
    else
        return false;                        // Otherwise it is not
}

/**
 * Check for sortable-array-like objects
 */
module.exports.isSortableArrayLike = function (o) {
    return isArrayLike(o) && isSortable(o);
};


/***/ }),

/***/ 488:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\r\n/* Anit-boostrap tactix */\n.trading-vue *,\r\n::after,\r\n::before {\r\n  box-sizing: content-box;\n}\n.trading-vue img {\r\n  vertical-align: initial;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 734:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-botbar {\r\n    position: relative !important;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 933:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn-grp {\r\n    margin-left: 0.5em;\r\n    display: flex;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 937:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-item-list {\r\n    position: absolute;\r\n    user-select: none;\r\n    margin-top: -5px;\n}\n.tvjs-item-list-item {\r\n    display: flex;\r\n    align-items: center;\r\n    padding-right: 20px;\r\n    font-size: 1.15em;\r\n    letter-spacing: 0.05em;\n}\n.tvjs-item-list-item:hover {\r\n    background-color: #76878319;\n}\n.tvjs-item-list-item * {\r\n    position: relative !important;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 508:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-legend {\r\n    position: relative;\r\n    z-index: 1;\r\n    font-size: 1.25em;\r\n    margin-left: 10px;\r\n    pointer-events: none;\r\n    text-align: left;\r\n    user-select: none;\r\n    font-weight: 300;\n}\n@media (min-resolution: 2x) {\n.trading-vue-legend {\r\n        font-weight: 400;\n}\n}\n.trading-vue-ohlcv {\r\n    pointer-events: none;\r\n    margin-bottom: 0.5em;\n}\n.t-vue-lspan {\r\n    font-variant-numeric: tabular-nums;\r\n    font-size: 0.95em;\r\n    color: #999999;\r\n    /* TODO: move => params */\r\n    margin-left: 0.1em;\r\n    margin-right: 0.2em;\n}\n.t-vue-title {\r\n    margin-right: 0.25em;\r\n    font-size: 1.45em;\n}\n.t-vue-ind {\r\n    display: flex;\r\n    margin-left: 0.2em;\r\n    margin-bottom: 0.5em;\r\n    font-size: 1.0em;\r\n    margin-top: 0.3em;\n}\n.t-vue-ivalue {\r\n    margin-left: 0.5em;\n}\n.t-vue-unknown {\r\n    color: #999999;\r\n    /* TODO: move => params */\n}\n.tvjs-appear-enter-active,\r\n.tvjs-appear-leave-active {\r\n    transition: all .25s ease;\n}\n.tvjs-appear-enter,\r\n.tvjs-appear-leave-to {\r\n    opacity: 0;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 554:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn {\r\n    z-index: 100;\r\n    pointer-events: all;\r\n    cursor: pointer;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 747:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-section {\r\n  height: 0;\r\n  position: absolute;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 407:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-spinner {\r\n    display: inline-block;\r\n    position: relative;\r\n    width: 20px;\r\n    height: 16px;\r\n    margin: -4px 0px -1px 0px;\r\n    opacity: 0.7;\n}\n.tvjs-spinner div {\r\n    position: absolute;\r\n    top: 8px;\r\n    width: 4px;\r\n    height: 4px;\r\n    border-radius: 50%;\r\n    animation-timing-function: cubic-bezier(1, 1, 1, 1);\n}\n.tvjs-spinner div:nth-child(1) {\r\n    left: 2px;\r\n    animation: tvjs-spinner1 0.6s infinite;\r\n    opacity: 0.9;\n}\n.tvjs-spinner div:nth-child(2) {\r\n    left: 2px;\r\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(3) {\r\n    left: 9px;\r\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(4) {\r\n    left: 16px;\r\n    animation: tvjs-spinner3 0.6s infinite;\r\n    opacity: 0.9;\n}\n@keyframes tvjs-spinner1 {\n0% {\r\n        transform: scale(0);\n}\n100% {\r\n        transform: scale(1);\n}\n}\n@keyframes tvjs-spinner3 {\n0% {\r\n        transform: scale(1);\n}\n100% {\r\n        transform: scale(0);\n}\n}\n@keyframes tvjs-spinner2 {\n0% {\r\n        transform: translate(0, 0);\n}\n100% {\r\n        transform: translate(7px, 0);\n}\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 965:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-drift-enter-active {\r\n    transition: all .3s ease;\n}\n.tvjs-drift-leave-active {\r\n    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);\n}\n.tvjs-drift-enter, .tvjs-drift-leave-to\r\n{\r\n    transform: translateX(10px);\r\n    opacity: 0;\n}\n.tvjs-the-tip {\r\n    position: absolute;\r\n    width: 200px;\r\n    text-align: center;\r\n    z-index: 10001;\r\n    color: #ffffff;\r\n    font-size: 1.5em;\r\n    line-height: 1.15em;\r\n    padding: 10px;\r\n    border-radius: 3px;\r\n    right: 70px;\r\n    top: 10px;\r\n    text-shadow: 1px 1px black;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 600:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-legend {\r\n    position: relative;\r\n    z-index: 1;\r\n    font-size: 1.25em;\r\n    margin-left: 10px;\r\n    pointer-events: none;\r\n    text-align: left;\r\n    user-select: none;\r\n    font-weight: 300;\n}\n@media (min-resolution: 2x) {\n.trading-vue-legend {\r\n        font-weight: 400;\n}\n}\n.trading-vue-ohlcv {\r\n    pointer-events: none;\r\n    margin-bottom: 0.5em;\n}\n.t-vue-lspan {\r\n    font-variant-numeric: tabular-nums;\r\n    font-size: 0.95em;\r\n    color: #999999; /* TODO: move => params */\r\n    margin-left: 0.1em;\r\n    margin-right: 0.2em;\n}\n.t-vue-title {\r\n    margin-right: 0.25em;\r\n    font-size: 1.45em;\n}\n.t-vue-ind {\r\n  display: flex;\r\n    margin-left: 0.2em;\r\n    margin-bottom: 0.5em;\r\n    font-size: 1.0em;\r\n    margin-top: 0.3em;\n}\n.t-vue-ivalue {\r\n    margin-left: 0.5em;\n}\n.t-vue-unknown {\r\n    color: #999999; /* TODO: move => params */\n}\n.tvjs-appear-enter-active,\r\n.tvjs-appear-leave-active\r\n{\r\n    transition: all .25s ease;\n}\n.tvjs-appear-enter, .tvjs-appear-leave-to\r\n{\r\n    opacity: 0;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 583:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-toolbar {\r\n    position: absolute;\r\n    border-right: 1px solid black;\r\n    z-index: 101;\r\n    padding-top: 3px;\r\n    user-select: none;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 208:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-tbitem {\n}\n.trading-vue-tbitem:hover {\r\n    background-color: #76878319;\n}\n.trading-vue-tbitem-exp {\r\n    position: absolute;\r\n    right: -3px;\r\n    padding: 18.5px 5px;\r\n    font-stretch: extra-condensed;\r\n    transform: scaleX(0.6);\r\n    font-size: 0.6em;\r\n    opacity: 0.0;\r\n    user-select: none;\r\n    line-height: 0;\n}\n.trading-vue-tbitem:hover\r\n.trading-vue-tbitem-exp {\r\n    opacity: 0.5;\n}\n.trading-vue-tbitem-exp:hover {\r\n    background-color: #76878330;\r\n    opacity: 0.9 !important;\n}\n.trading-vue-tbicon {\r\n    position: absolute;\n}\n.trading-vue-tbitem.selected-item > .trading-vue-tbicon,\r\n.tvjs-item-list-item.selected-item > .trading-vue-tbicon {\r\n     filter: brightness(1.45) sepia(1) hue-rotate(90deg) saturate(4.5) !important;\n}\n.tvjs-pixelated {\r\n    -ms-interpolation-mode: nearest-neighbor;\r\n    image-rendering: -webkit-optimize-contrast;\r\n    image-rendering: -webkit-crisp-edges;\r\n    image-rendering: -moz-crisp-edges;\r\n    image-rendering: -o-crisp-edges;\r\n    image-rendering: pixelated;\n}\r\n\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 555:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-ux-wrapper {\n    position: absolute;\n    display: flex;\n}\n.tvjs-ux-wrapper-pin {\n    position: absolute;\n    width: 9px;\n    height: 9px;\n    z-index: 100;\n    background-color: #23a776;\n    border-radius: 10px;\n    margin-left: -6px;\n    margin-top: -6px;\n    pointer-events: none;\n}\n.tvjs-ux-wrapper-head {\n    position: absolute;\n    height: 23px;\n    width: 100%;\n}\n.tvjs-ux-wrapper-close {\n    position: absolute;\n    width: 11px;\n    height: 11px;\n    font-size: 1.5em;\n    line-height: 0.5em;\n    padding: 1px 1px 1px 1px;\n    border-radius: 10px;\n    right: 5px;\n    top: 5px;\n    user-select: none;\n    text-align: center;\n    z-index: 100;\n}\n.tvjs-ux-wrapper-close-hb {\n}\n.tvjs-ux-wrapper-close:hover {\n    background-color: #FF605C !important;\n    color: #692324 !important;\n}\n.tvjs-ux-wrapper-full {\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 260:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(314);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-widgets {\r\n    position: absolute;\r\n    z-index: 1000;\r\n    pointer-events: none;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 314:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ 168:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
        return Hammer;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}

})(window, document, 'Hammer');


/***/ }),

/***/ 240:
/***/ ((module) => {

/*
 * Hamster.js v1.1.2
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

(function(window, document){
'use strict';

/**
 * Hamster
 * use this to create instances
 * @returns {Hamster.Instance}
 * @constructor
 */
var Hamster = function(element) {
  return new Hamster.Instance(element);
};

// default event name
Hamster.SUPPORT = 'wheel';

// default DOM methods
Hamster.ADD_EVENT = 'addEventListener';
Hamster.REMOVE_EVENT = 'removeEventListener';
Hamster.PREFIX = '';

// until browser inconsistencies have been fixed...
Hamster.READY = false;

Hamster.Instance = function(element){
  if (!Hamster.READY) {
    // fix browser inconsistencies
    Hamster.normalise.browser();

    // Hamster is ready...!
    Hamster.READY = true;
  }

  this.element = element;

  // store attached event handlers
  this.handlers = [];

  // return instance
  return this;
};

/**
 * create new hamster instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @returns {Hamster.Instance}
 * @constructor
 */
Hamster.Instance.prototype = {
  /**
   * bind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  wheel: function onEvent(handler, useCapture){
    Hamster.event.add(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.add(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  },

  /**
   * unbind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  unwheel: function offEvent(handler, useCapture){
    // if no handler argument,
    // unbind the last bound handler (if exists)
    if (handler === undefined && (handler = this.handlers.slice(-1)[0])) {
      handler = handler.original;
    }

    Hamster.event.remove(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.remove(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  }
};

Hamster.event = {
  /**
   * cross-browser 'addWheelListener'
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  add: function add(hamster, eventName, handler, useCapture){
    // store the original handler
    var originalHandler = handler;

    // redefine the handler
    handler = function(originalEvent){

      if (!originalEvent) {
        originalEvent = window.event;
      }

      // create a normalised event object,
      // and normalise "deltas" of the mouse wheel
      var event = Hamster.normalise.event(originalEvent),
          delta = Hamster.normalise.delta(originalEvent);

      // fire the original handler with normalised arguments
      return originalHandler(event, delta[0], delta[1], delta[2]);

    };

    // cross-browser addEventListener
    hamster.element[Hamster.ADD_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // store original and normalised handlers on the instance
    hamster.handlers.push({
      original: originalHandler,
      normalised: handler
    });
  },

  /**
   * removeWheelListener
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  remove: function remove(hamster, eventName, handler, useCapture){
    // find the normalised handler on the instance
    var originalHandler = handler,
        lookup = {},
        handlers;
    for (var i = 0, len = hamster.handlers.length; i < len; ++i) {
      lookup[hamster.handlers[i].original] = hamster.handlers[i];
    }
    handlers = lookup[originalHandler];
    handler = handlers.normalised;

    // cross-browser removeEventListener
    hamster.element[Hamster.REMOVE_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // remove original and normalised handlers from the instance
    for (var h in hamster.handlers) {
      if (hamster.handlers[h] == handlers) {
        hamster.handlers.splice(h, 1);
        break;
      }
    }
  }
};

/**
 * these hold the lowest deltas,
 * used to normalise the delta values
 * @type {Number}
 */
var lowestDelta,
    lowestDeltaXY;

Hamster.normalise = {
  /**
   * fix browser inconsistencies
   */
  browser: function normaliseBrowser(){
    // detect deprecated wheel events
    if (!('onwheel' in document || document.documentMode >= 9)) {
      Hamster.SUPPORT = document.onmousewheel !== undefined ?
                        'mousewheel' : // webkit and IE < 9 support at least "mousewheel"
                        'DOMMouseScroll'; // assume remaining browsers are older Firefox
    }

    // detect deprecated event model
    if (!window.addEventListener) {
      // assume IE < 9
      Hamster.ADD_EVENT = 'attachEvent';
      Hamster.REMOVE_EVENT = 'detachEvent';
      Hamster.PREFIX = 'on';
    }

  },

  /**
   * create a normalised event object
   * @param   {Function}    originalEvent
   * @returns {Object}      event
   */
   event: function normaliseEvent(originalEvent){
    var event = {
          // keep a reference to the original event object
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: 'wheel',
          deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
          deltaX: 0,
          deltaZ: 0,
          preventDefault: function(){
            if (originalEvent.preventDefault) {
              originalEvent.preventDefault();
            } else {
              originalEvent.returnValue = false;
            }
          },
          stopPropagation: function(){
            if (originalEvent.stopPropagation) {
              originalEvent.stopPropagation();
            } else {
              originalEvent.cancelBubble = false;
            }
          }
        };

    // calculate deltaY (and deltaX) according to the event

    // 'mousewheel'
    if (originalEvent.wheelDelta) {
      event.deltaY = - 1/40 * originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaX) {
      event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
    }

    // 'DomMouseScroll'
    if (originalEvent.detail) {
      event.deltaY = originalEvent.detail;
    }

    return event;
  },

  /**
   * normalise 'deltas' of the mouse wheel
   * @param   {Function}    originalEvent
   * @returns {Array}       deltas
   */
  delta: function normaliseDelta(originalEvent){
    var delta = 0,
      deltaX = 0,
      deltaY = 0,
      absDelta = 0,
      absDeltaXY = 0,
      fn;

    // normalise deltas according to the event

    // 'wheel' event
    if (originalEvent.deltaY) {
      deltaY = originalEvent.deltaY * -1;
      delta  = deltaY;
    }
    if (originalEvent.deltaX) {
      deltaX = originalEvent.deltaX;
      delta  = deltaX * -1;
    }

    // 'mousewheel' event
    if (originalEvent.wheelDelta) {
      delta = originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaY) {
      deltaY = originalEvent.wheelDeltaY;
    }
    if (originalEvent.wheelDeltaX) {
      deltaX = originalEvent.wheelDeltaX * -1;
    }

    // 'DomMouseScroll' event
    if (originalEvent.detail) {
      delta = originalEvent.detail * -1;
    }

    // Don't return NaN
    if (delta === 0) {
      return [0, 0, 0];
    }

    // look for lowest delta to normalize the delta values
    absDelta = Math.abs(delta);
    if (!lowestDelta || absDelta < lowestDelta) {
      lowestDelta = absDelta;
    }
    absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
    if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
      lowestDeltaXY = absDeltaXY;
    }

    // convert deltas to whole numbers
    fn = delta > 0 ? 'floor' : 'ceil';
    delta  = Math[fn](delta / lowestDelta);
    deltaX = Math[fn](deltaX / lowestDeltaXY);
    deltaY = Math[fn](deltaY / lowestDeltaXY);

    return [delta, deltaX, deltaY];
  }
};

if (typeof window.define === 'function' && window.define.amd) {
  // AMD
  window.define('hamster', [], function(){
    return Hamster;
  });
} else if (true) {
  // CommonJS
  module.exports = Hamster;
} else {}

})(window, window.document);


/***/ }),

/***/ 992:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.5
var LZString = (function() {

// private property
var f = String.fromCharCode;
var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
var baseReverseDic = {};

function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (var i=0 ; i<alphabet.length ; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

var LZString = {
  compressToBase64 : function (input) {
    if (input == null) return "";
    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
    switch (res.length % 4) { // To produce valid Base64
    default: // When could this happen ?
    case 0 : return res;
    case 1 : return res+"===";
    case 2 : return res+"==";
    case 3 : return res+"=";
    }
  },

  decompressFromBase64 : function (input) {
    if (input == null) return "";
    if (input == "") return null;
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
  },

  compressToUTF16 : function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
  },

  decompressFromUTF16: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
  },

  //compress into uint8array (UCS-2 big endian format)
  compressToUint8Array: function (uncompressed) {
    var compressed = LZString.compress(uncompressed);
    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
      var current_value = compressed.charCodeAt(i);
      buf[i*2] = current_value >>> 8;
      buf[i*2+1] = current_value % 256;
    }
    return buf;
  },

  //decompress from uint8array (UCS-2 big endian format)
  decompressFromUint8Array:function (compressed) {
    if (compressed===null || compressed===undefined){
        return LZString.decompress(compressed);
    } else {
        var buf=new Array(compressed.length/2); // 2 bytes per character
        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
          buf[i]=compressed[i*2]*256+compressed[i*2+1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(''));

    }

  },


  //compress into a string that is already URI encoded
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
  },

  //decompress from an output of compressToEncodedURIComponent
  decompressFromEncodedURIComponent:function (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  },

  compress: function (uncompressed) {
    return LZString._compress(uncompressed, 16, function(a){return f(a);});
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_data=[],
        context_data_val=0,
        context_data_position=0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position ==bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    // Output the code for w.
    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == bitsPerChar-1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }


      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == bitsPerChar-1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar-1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      }
      else context_data_position++;
    }
    return context_data.join('');
  },

  decompress: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
  },

  _decompress: function (length, resetValue, getNextValue) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits, resb, maxpower, power,
        c,
        data = {val:getNextValue(0), position:resetValue, index:1};

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

    }
  }
};
  return LZString;
})();

if (true) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () { return LZString; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}


/***/ }),

/***/ 255:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(488);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("643d0528", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 531:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(734);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("45aee8ee", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 834:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(933);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("0fc51e60", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 796:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(937);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("2b589460", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 305:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(508);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("4460fbc2", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 179:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(554);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("3f4f243d", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 280:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(747);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("79b22508", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 688:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(407);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("0f5b62f0", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 892:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(965);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("869c9886", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 463:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(600);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("aa7b6b1e", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 928:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(583);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("84d4e530", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 395:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(208);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("413e01f6", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 392:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(555);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("7de21f27", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 427:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(260);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(534)/* ["default"] */ .A)
var update = add("85e1d57a", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 534:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ addStylesClient)
});

;// ./node_modules/vue-style-loader/lib/listToStyles.js
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}

;// ./node_modules/vue-style-loader/lib/addStylesClient.js
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/



var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

function addStylesClient (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ 633:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(738)["default"]);
function _regeneratorRuntime() {
  "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return e;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var t,
    e = {},
    r = Object.prototype,
    n = r.hasOwnProperty,
    o = Object.defineProperty || function (t, e, r) {
      t[e] = r.value;
    },
    i = "function" == typeof Symbol ? Symbol : {},
    a = i.iterator || "@@iterator",
    c = i.asyncIterator || "@@asyncIterator",
    u = i.toStringTag || "@@toStringTag";
  function define(t, e, r) {
    return Object.defineProperty(t, e, {
      value: r,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), t[e];
  }
  try {
    define({}, "");
  } catch (t) {
    define = function define(t, e, r) {
      return t[e] = r;
    };
  }
  function wrap(t, e, r, n) {
    var i = e && e.prototype instanceof Generator ? e : Generator,
      a = Object.create(i.prototype),
      c = new Context(n || []);
    return o(a, "_invoke", {
      value: makeInvokeMethod(t, r, c)
    }), a;
  }
  function tryCatch(t, e, r) {
    try {
      return {
        type: "normal",
        arg: t.call(e, r)
      };
    } catch (t) {
      return {
        type: "throw",
        arg: t
      };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart",
    l = "suspendedYield",
    f = "executing",
    s = "completed",
    y = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var p = {};
  define(p, a, function () {
    return this;
  });
  var d = Object.getPrototypeOf,
    v = d && d(d(values([])));
  v && v !== r && n.call(v, a) && (p = v);
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t) {
    ["next", "throw", "return"].forEach(function (e) {
      define(t, e, function (t) {
        return this._invoke(e, t);
      });
    });
  }
  function AsyncIterator(t, e) {
    function invoke(r, o, i, a) {
      var c = tryCatch(t[r], t, o);
      if ("throw" !== c.type) {
        var u = c.arg,
          h = u.value;
        return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
          invoke("next", t, i, a);
        }, function (t) {
          invoke("throw", t, i, a);
        }) : e.resolve(h).then(function (t) {
          u.value = t, i(u);
        }, function (t) {
          return invoke("throw", t, i, a);
        });
      }
      a(c.arg);
    }
    var r;
    o(this, "_invoke", {
      value: function value(t, n) {
        function callInvokeWithMethodAndArg() {
          return new e(function (e, r) {
            invoke(t, n, e, r);
          });
        }
        return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(e, r, n) {
    var o = h;
    return function (i, a) {
      if (o === f) throw Error("Generator is already running");
      if (o === s) {
        if ("throw" === i) throw a;
        return {
          value: t,
          done: !0
        };
      }
      for (n.method = i, n.arg = a;;) {
        var c = n.delegate;
        if (c) {
          var u = maybeInvokeDelegate(c, n);
          if (u) {
            if (u === y) continue;
            return u;
          }
        }
        if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
          if (o === h) throw o = s, n.arg;
          n.dispatchException(n.arg);
        } else "return" === n.method && n.abrupt("return", n.arg);
        o = f;
        var p = tryCatch(e, r, n);
        if ("normal" === p.type) {
          if (o = n.done ? s : l, p.arg === y) continue;
          return {
            value: p.arg,
            done: n.done
          };
        }
        "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
      }
    };
  }
  function maybeInvokeDelegate(e, r) {
    var n = r.method,
      o = e.iterator[n];
    if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
    var i = tryCatch(o, e.iterator, r.arg);
    if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
    var a = i.arg;
    return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
  }
  function pushTryEntry(t) {
    var e = {
      tryLoc: t[0]
    };
    1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
  }
  function resetTryEntry(t) {
    var e = t.completion || {};
    e.type = "normal", delete e.arg, t.completion = e;
  }
  function Context(t) {
    this.tryEntries = [{
      tryLoc: "root"
    }], t.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(e) {
    if (e || "" === e) {
      var r = e[a];
      if (r) return r.call(e);
      if ("function" == typeof e.next) return e;
      if (!isNaN(e.length)) {
        var o = -1,
          i = function next() {
            for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
            return next.value = t, next.done = !0, next;
          };
        return i.next = i;
      }
    }
    throw new TypeError(_typeof(e) + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), o(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
    var e = "function" == typeof t && t.constructor;
    return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
  }, e.mark = function (t) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
  }, e.awrap = function (t) {
    return {
      __await: t
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
    return this;
  }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
    void 0 === i && (i = Promise);
    var a = new AsyncIterator(wrap(t, r, n, o), i);
    return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
      return t.done ? t.value : a.next();
    });
  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
    return this;
  }), define(g, "toString", function () {
    return "[object Generator]";
  }), e.keys = function (t) {
    var e = Object(t),
      r = [];
    for (var n in e) r.push(n);
    return r.reverse(), function next() {
      for (; r.length;) {
        var t = r.pop();
        if (t in e) return next.value = t, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, e.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(e) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
    },
    stop: function stop() {
      this.done = !0;
      var t = this.tryEntries[0].completion;
      if ("throw" === t.type) throw t.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(e) {
      if (this.done) throw e;
      var r = this;
      function handle(n, o) {
        return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
      }
      for (var o = this.tryEntries.length - 1; o >= 0; --o) {
        var i = this.tryEntries[o],
          a = i.completion;
        if ("root" === i.tryLoc) return handle("end");
        if (i.tryLoc <= this.prev) {
          var c = n.call(i, "catchLoc"),
            u = n.call(i, "finallyLoc");
          if (c && u) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          } else if (c) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
          } else {
            if (!u) throw Error("try statement without catch or finally");
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(t, e) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var o = this.tryEntries[r];
        if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
          var i = o;
          break;
        }
      }
      i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
      var a = i ? i.completion : {};
      return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
    },
    complete: function complete(t, e) {
      if ("throw" === t.type) throw t.arg;
      return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
    },
    finish: function finish(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
      }
    },
    "catch": function _catch(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.tryLoc === t) {
          var n = r.completion;
          if ("throw" === n.type) {
            var o = n.arg;
            resetTryEntry(r);
          }
          return o;
        }
      }
      throw Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(e, r, n) {
      return this.delegate = {
        iterator: values(e),
        resultName: r,
        nextLoc: n
      }, "next" === this.method && (this.arg = t), y;
    }
  }, e;
}
module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 738:
/***/ ((module) => {

function _typeof(o) {
  "@babel/helpers - typeof";

  return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 756:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// TODO(Babel 8): Remove this file.

var runtime = __webpack_require__(633)();
module.exports = runtime;

// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Candle: () => (/* reexport */ CandleExt),
  Constants: () => (/* reexport */ constants),
  DataCube: () => (/* reexport */ DataCube),
  Interface: () => (/* reexport */ mixins_interface),
  Overlay: () => (/* reexport */ overlay),
  Tool: () => (/* reexport */ tool),
  TradingVue: () => (/* reexport */ TradingVue),
  Utils: () => (/* reexport */ utils),
  Volbar: () => (/* reexport */ VolbarExt),
  "default": () => (/* binding */ src),
  layout_cnv: () => (/* reexport */ layout_cnv),
  layout_vol: () => (/* reexport */ layout_vol),
  primitives: () => (/* binding */ primitives)
});

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=template&id=3866ff4a
var render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    staticClass: "trading-vue",
    style: {
      color: this.chart_props.colors.text,
      font: this.font_comp,
      width: this.width + 'px',
      height: this.height + 'px'
    },
    attrs: {
      "id": _vm.id
    },
    on: {
      "mousedown": _vm.mousedown,
      "mouseleave": _vm.mouseleave
    }
  }, [_vm.toolbar ? _c('toolbar', _vm._b({
    ref: "toolbar",
    attrs: {
      "config": _vm.chart_config
    },
    on: {
      "custom-event": _vm.custom_event
    }
  }, 'toolbar', _vm.chart_props, false)) : _vm._e(), _vm._v(" "), _vm.controllers.length ? _c('widgets', {
    ref: "widgets",
    attrs: {
      "map": _vm.ws,
      "width": _vm.width,
      "height": _vm.height,
      "tv": this,
      "dc": _vm.data
    }
  }) : _vm._e(), _vm._v(" "), _c('chart', _vm._b({
    key: _vm.reset,
    ref: "chart",
    attrs: {
      "enableZoom": _vm.enableZoom,
      "showTitleChartLegend": _vm.showTitleChartLegend,
      "isOverlayCollapsed": _vm.isOverlayCollapsed,
      "collpaseButton": _vm.collpaseButton,
      "enableSideBarBoxValue": _vm.enableSideBarBoxValue,
      "applyShaders": _vm.applyShaders,
      "priceLine": _vm.priceLine,
      "decimalPlace": _vm.decimalPlace,
      "legendDecimal": _vm.legendDecimal,
      "enableCrosshair": _vm.enableCrosshair,
      "ignoreNegativeIndex": _vm.ignoreNegativeIndex,
      "ignore_OHLC": _vm.ignore_OHLC,
      "tv_id": _vm.id,
      "config": _vm.chart_config
    },
    on: {
      "custom-event": _vm.custom_event,
      "range-changed": _vm.range_changed,
      "chart_data_changed": _vm.chart_data_changed,
      "sidebar-transform": _vm.sidebar_transform,
      "legend-button-click": _vm.legend_button,
      "on-collapse-change": _vm.collapse_button
    }
  }, 'chart', _vm.chart_props, false)), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "tvjs-drift"
    }
  }, [_vm.tip ? _c('the-tip', {
    attrs: {
      "data": _vm.tip
    },
    on: {
      "remove-me": function removeMe($event) {
        _vm.tip = null;
      }
    }
  }) : _vm._e()], 1)], 1);
};
var staticRenderFns = [];
render._withStripped = true;

;// ./src/TradingVue.vue?vue&type=template&id=3866ff4a

;// ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}

;// ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js

function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}

;// ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}

;// ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js

function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

;// ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

;// ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js




function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}

;// ./src/stuff/constants.js
var SECOND = 1000;
var MINUTE = SECOND * 60;
var MINUTE3 = MINUTE * 3;
var MINUTE5 = MINUTE * 5;
var MINUTE15 = MINUTE * 15;
var MINUTE30 = MINUTE * 30;
var HOUR = MINUTE * 60;
var HOUR4 = HOUR * 4;
var HOUR12 = HOUR * 12;
var DAY = HOUR * 24;
var WEEK = DAY * 7;
var MONTH = WEEK * 4;
var YEAR = DAY * 365;
var MONTHMAP = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Grid time steps
var TIMESCALES = [YEAR * 10, YEAR * 5, YEAR * 3, YEAR * 2, YEAR, MONTH * 6, MONTH * 4, MONTH * 3, MONTH * 2, MONTH, DAY * 15, DAY * 10, DAY * 7, DAY * 5, DAY * 3, DAY * 2, DAY, HOUR * 12, HOUR * 6, HOUR * 3, HOUR * 1.5, HOUR, MINUTE30, MINUTE15, MINUTE * 10, MINUTE5, MINUTE * 2, MINUTE];

// Grid $ steps
var $SCALES = [0.05, 0.1, 0.2, 0.25, 0.5, 0.8, 1, 2, 5];
var ChartConfig = {
  SBMIN: 60,
  // Minimal sidebar px
  SBMAX: Infinity,
  // Max sidebar, px
  TOOLBAR: 57,
  // Toolbar width px
  TB_ICON: 25,
  // Toolbar icon size px
  TB_ITEM_M: 6,
  // Toolbar item margin px
  TB_ICON_BRI: 1,
  // Toolbar icon brightness
  TB_ICON_HOLD: 420,
  // ms, wait to expand
  TB_BORDER: 1,
  // Toolbar border px
  TB_B_STYLE: 'dotted',
  // Toolbar border style
  TOOL_COLL: 7,
  // Tool collision threshold
  EXPAND: 0.15,
  // %/100 of range
  CANDLEW: 0.6,
  // %/100 of step
  GRIDX: 100,
  // px
  GRIDY: 47,
  // px
  BOTBAR: 28,
  // px
  PANHEIGHT: 22,
  // px
  DEFAULT_LEN: 50,
  // candles
  MINIMUM_LEN: 5,
  // candles,
  MIN_ZOOM: 25,
  // candles
  MAX_ZOOM: 1000,
  // candles,
  VOLSCALE: 0.15,
  // %/100 of height
  UX_OPACITY: 0.9,
  // Ux background opacity
  ZOOM_MODE: 'tv',
  // 'tv' or 'tl'
  L_BTN_SIZE: 21,
  // Legend Button size, px
  L_BTN_MARGIN: '-6px 0 -6px 0',
  // css margin
  SCROLL_WHEEL: 'prevent' // 'pass', 'click'
};
ChartConfig.FONT = "11px -apple-system,BlinkMacSystemFont,\n    Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,\n    Fira Sans,Droid Sans,Helvetica Neue,\n    sans-serif";
var IB_TF_WARN = 'When using IB mode you should specify ' + 'timeframe (\'tf\' filed in \'chart\' object),' + 'otherwise you can get an unexpected behaviour';
var MAP_UNIT = {
  '1s': SECOND,
  '5s': SECOND * 5,
  '10s': SECOND * 10,
  '20s': SECOND * 20,
  '30s': SECOND * 30,
  '1m': MINUTE,
  '3m': MINUTE3,
  '5m': MINUTE5,
  '15m': MINUTE15,
  '30m': MINUTE30,
  '1H': HOUR,
  '2H': HOUR * 2,
  '3H': HOUR * 3,
  '4H': HOUR4,
  '12H': HOUR12,
  '1D': DAY,
  '1W': WEEK,
  '1M': MONTH,
  '1Y': YEAR
};
/* harmony default export */ const constants = ({
  SECOND: SECOND,
  MINUTE: MINUTE,
  MINUTE5: MINUTE5,
  MINUTE15: MINUTE15,
  MINUTE30: MINUTE30,
  HOUR: HOUR,
  HOUR4: HOUR4,
  DAY: DAY,
  WEEK: WEEK,
  MONTH: MONTH,
  YEAR: YEAR,
  MONTHMAP: MONTHMAP,
  TIMESCALES: TIMESCALES,
  $SCALES: $SCALES,
  ChartConfig: ChartConfig,
  map_unit: MAP_UNIT,
  IB_TF_WARN: IB_TF_WARN
});
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=template&id=27c57e52
var Chartvue_type_template_id_27c57e52_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    staticClass: "trading-vue-chart",
    style: _vm.styles
  }, [_c('keyboard', {
    ref: "keyboard"
  }), _vm._v(" "), _vm._l(this._layout.grids, function (grid, i) {
    return _c('grid-section', {
      key: grid.id,
      ref: "sec",
      refInFor: true,
      attrs: {
        "common": _vm.section_props(i),
        "grid_id": i,
        "enableZoom": _vm.enableZoom,
        "enableSideBarBoxValue": _vm.enableSideBarBoxValue,
        "decimalPlace": _vm.decimalPlace,
        "legendDecimal": _vm.legendDecimal,
        "applyShaders": _vm.applyShaders,
        "priceLine": _vm.priceLine,
        "enableCrosshair": _vm.enableCrosshair,
        "ignore_OHLC": _vm.ignore_OHLC,
        "tv_id": _vm.tv_id,
        "showTitleChartLegend": _vm.showTitleChartLegend,
        "isOverlayCollapsed": _vm.isOverlayCollapsed,
        "collpaseButton": _vm.collpaseButton
      },
      on: {
        "register-kb-listener": _vm.register_kb,
        "remove-kb-listener": _vm.remove_kb,
        "range-changed": _vm.range_changed,
        "cursor-changed": _vm.cursor_changed,
        "cursor-locked": _vm.cursor_locked,
        "sidebar-transform": _vm.set_ytransform,
        "layer-meta-props": _vm.layer_meta_props,
        "custom-event": _vm.emit_custom_event,
        "legend-button-click": _vm.legend_button_click,
        "on-collapse-change": _vm.collapse_button_click
      }
    });
  }), _vm._v(" "), _c('botbar', _vm._b({
    attrs: {
      "shaders": _vm.shaders,
      "timezone": _vm.timezone
    }
  }, 'botbar', _vm.botbar_props, false))], 2);
};
var Chartvue_type_template_id_27c57e52_staticRenderFns = [];
Chartvue_type_template_id_27c57e52_render._withStripped = true;

;// ./src/components/Chart.vue?vue&type=template&id=27c57e52

;// ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}

;// ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}

;// ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

;// ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js




function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}

;// ./src/stuff/context.js
// Canvas context for text measurments

function Context($p) {
  var el = document.createElement('canvas');
  var ctx = el.getContext('2d');
  ctx.font = $p.font;
  return ctx;
}
/* harmony default export */ const context = (Context);
// EXTERNAL MODULE: ./node_modules/arrayslicer/lib/index.js
var lib = __webpack_require__(74);
var lib_default = /*#__PURE__*/__webpack_require__.n(lib);
;// ./src/stuff/utils.js



/* harmony default export */ const utils = ({
  clamp: function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  },
  add_zero: function add_zero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  },
  // Start of the day (zero millisecond)
  day_start: function day_start(t) {
    var start = new Date(t);
    return start.setUTCHours(0, 0, 0, 0);
  },
  // Start of the month
  month_start: function month_start(t) {
    var date = new Date(t);
    return Date.UTC(date.getFullYear(), date.getMonth(), 1);
  },
  // Start of the year
  year_start: function year_start(t) {
    return Date.UTC(new Date(t).getFullYear());
  },
  get_year: function get_year(t) {
    if (!t) return undefined;
    return new Date(t).getUTCFullYear();
  },
  get_month: function get_month(t) {
    if (!t) return undefined;
    return new Date(t).getUTCMonth();
  },
  // Nearest in array
  nearest_a: function nearest_a(x, array) {
    var dist = Infinity;
    var val = null;
    var index = -1;
    for (var i = 0; i < array.length; i++) {
      var xi = array[i];
      if (Math.abs(xi - x) < dist) {
        dist = Math.abs(xi - x);
        val = xi;
        index = i;
      }
    }
    return [index, val];
  },
  round: function round(num, decimals) {
    if (decimals === void 0) {
      decimals = 8;
    }
    return parseFloat(num.toFixed(decimals));
  },
  // Strip? No, it's ugly floats in js
  strip: function strip(number) {
    return parseFloat(parseFloat(number).toPrecision(12));
  },
  get_day: function get_day(t) {
    return t ? new Date(t).getDate() : null;
  },
  // Update array keeping the same reference
  overwrite: function overwrite(arr, new_arr) {
    arr.splice.apply(arr, [0, arr.length].concat(_toConsumableArray(new_arr)));
  },
  // Copy layout in reactive way
  copy_layout: function copy_layout(obj, new_obj) {
    for (var k in obj) {
      if (Array.isArray(obj[k])) {
        // (some offchart indicators are added/removed)
        // we need to update layout in a reactive way
        if (obj[k].length !== new_obj[k].length) {
          this.overwrite(obj[k], new_obj[k]);
          continue;
        }
        for (var m in obj[k]) {
          Object.assign(obj[k][m], new_obj[k][m]);
        }
      } else {
        Object.assign(obj[k], new_obj[k]);
      }
    }
  },
  // Detects candles interval
  detect_interval: function detect_interval(ohlcv) {
    var len = Math.min(ohlcv.length - 1, 99);
    var min = Infinity;
    ohlcv.slice(0, len).forEach(function (x, i) {
      var d = ohlcv[i + 1][0] - x[0];
      if (d === d && d < min) min = d;
    });
    // This saves monthly chart from being awkward
    if (min >= constants.MONTH && min <= constants.DAY * 30) {
      return constants.DAY * 31;
    }
    return min;
  },
  // Gets numberic part of overlay id (e.g 'EMA_1' = > 1)
  get_num_id: function get_num_id(id) {
    return parseInt(id.split('_').pop());
  },
  // Fast filter. Really fast, like 10X
  fast_filter: function fast_filter(arr, t1, t2) {
    if (!arr.length) return [arr, undefined];
    try {
      var ia = new (lib_default())(arr, '0');
      var res = ia.getRange(t1, t2);
      var i0 = ia.valpos[t1].next;
      return [res, i0];
    } catch (e) {
      // Something wrong with fancy slice lib
      // Fast fix: fallback to filter
      return [arr.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      }), 0];
    }
  },
  // Fast filter (index-based)
  fast_filter_i: function fast_filter_i(arr, t1, t2) {
    if (!arr.length) return [arr, undefined];
    var i1 = Math.floor(t1);
    if (i1 < 0) i1 = 0;
    var i2 = Math.floor(t2 + 1);
    var res = arr.slice(i1, i2);
    return [res, i1];
  },
  // Nearest indexes (left and right)
  fast_nearest: function fast_nearest(arr, t1) {
    var ia = new (lib_default())(arr, '0');
    ia.fetch(t1);
    return [ia.nextlow, ia.nexthigh];
  },
  now: function now() {
    return new Date().getTime();
  },
  pause: function pause(delay) {
    return new Promise(function (rs, rj) {
      return setTimeout(rs, delay);
    });
  },
  // Limit crazy wheel delta values
  smart_wheel: function smart_wheel(delta) {
    var abs = Math.abs(delta);
    if (abs > 500) {
      return (200 + Math.log(abs)) * Math.sign(delta);
    }
    return delta;
  },
  // Parse the original mouse event to find deltaX
  get_deltaX: function get_deltaX(event) {
    return event.originalEvent.deltaX / 12;
  },
  // Parse the original mouse event to find deltaY
  get_deltaY: function get_deltaY(event) {
    return event.originalEvent.deltaY / 12;
  },
  // Apply opacity to a hex color
  apply_opacity: function apply_opacity(c, op) {
    if (c.length === 7) {
      var n = Math.floor(op * 255);
      n = this.clamp(n, 0, 255);
      c += n.toString(16);
    }
    return c;
  },
  // Parse timeframe or return value in ms
  parse_tf: function parse_tf(smth) {
    if (typeof smth === 'string') {
      return constants.map_unit[smth];
    } else {
      return smth;
    }
  },
  // Detect index shift between the main data sub
  // and the overlay's sub (for IB-mode)
  index_shift: function index_shift(sub, data) {
    // Find the second timestamp (by value)
    if (!data.length) return 0;
    var first = data[0][0];
    var second;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] !== first) {
        second = data[i][0];
        break;
      }
    }
    for (var j = 0; j < sub.length; j++) {
      if (sub[j][0] === second) {
        return j - i;
      }
    }
    return 0;
  },
  // Fallback fix for Brave browser
  // https://github.com/brave/brave-browser/issues/1738
  measureText: function measureText(ctx, text, tv_id) {
    var m = ctx.measureTextOrg(text);
    if (m.width === 0) {
      var doc = document;
      var id = 'tvjs-measure-text';
      var el = doc.getElementById(id);
      if (!el) {
        var base = doc.getElementById(tv_id);
        el = doc.createElement('div');
        el.id = id;
        el.style.position = 'absolute';
        el.style.top = '-1000px';
        base.appendChild(el);
      }
      if (ctx.font) el.style.font = ctx.font;
      el.innerText = text.replace(/ /g, '.');
      return {
        width: el.offsetWidth
      };
    } else {
      return m;
    }
  },
  uuid: function uuid(temp) {
    if (temp === void 0) {
      temp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    }
    return temp.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  },
  uuid2: function uuid2() {
    return this.uuid('xxxxxxxxxxxx');
  },
  // Delayed warning, f = condition lambda fn
  warn: function warn(f, text, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    setTimeout(function () {
      if (f()) console.warn(text);
    }, delay);
  },
  // Checks if script props updated
  // (and not style settings or something else)
  is_scr_props_upd: function is_scr_props_upd(n, prev) {
    var p = prev.find(function (x) {
      return x.v.$uuid === n.v.$uuid;
    });
    if (!p) return false;
    var props = n.p.settings.$props;
    if (!props) return false;
    return props.some(function (x) {
      return n.v[x] !== p.v[x];
    });
  },
  // Checks if it's time to make a script update
  // (based on execInterval in ms)
  delayed_exec: function delayed_exec(v) {
    if (!v.script || !v.script.execInterval) return true;
    var t = this.now();
    var dt = v.script.execInterval;
    if (!v.settings.$last_exec || t > v.settings.$last_exec + dt) {
      v.settings.$last_exec = t;
      return true;
    }
    return false;
  },
  // Format names such 'RSI, $length', where
  // length - is one of the settings
  format_name: function format_name(ov) {
    if (!ov.name) return undefined;
    var name = ov.name;
    for (var k in ov.settings || {}) {
      var val = ov.settings[k];
      var reg = new RegExp("\\$".concat(k), 'g');
      name = name.replace(reg, val);
    }
    return name;
  },
  // Default cursor mode
  xmode: function xmode() {
    return this.is_mobile ? 'explore' : 'default';
  },
  default_prevented: function default_prevented(event) {
    if (event.original) {
      return event.original.defaultPrevented;
    }
    return event.defaultPrevented;
  },
  calculate_data_index_without_ti_map: function calculate_data_index_without_ti_map(array, target, tf) {
    if (tf === void 0) {
      tf = "D";
    }
    var left = 0;
    var right = array.length - 1;
    var found = false;
    var interval_ms = this.detect_interval(array);
    console.log("searchResults", interval_ms);
    var GetValue = function GetValue(i) {
      var _array$i;
      return array === null || array === void 0 || (_array$i = array[i]) === null || _array$i === void 0 ? void 0 : _array$i[0];
    };
    while (left <= right) {
      var mid = Math.floor((left + right) / 2);
      var midTimestamp = GetValue(mid);
      if (midTimestamp === target) {
        return {
          index: mid,
          difference: 0
        }; // Found the target
      } else if (midTimestamp < target) {
        left = mid + 1; // Target is in the right half
      } else {
        right = mid - 1; // Target is in the left half
      }
    }
    var targetDate = new Date(target).toLocaleString();
    // Target not found, determine which side it would be on and calculate the difference
    var side;
    var difference;
    var closeInd;
    var maxInd = Math.max(left, right);
    var minIndex = Math.min(left, right);
    var diffBtwCandles = GetValue(maxInd) - GetValue(minIndex);
    if (target < GetValue(left)) {
      side = 'left';
      // difference = array[left] - target;
      difference = target - GetValue(right);
      closeInd = right;
    } else {
      side = 'right';
      difference = target - GetValue(right);
      closeInd = right;
    }
    var offSetValue = difference / interval_ms;
    var offSetValueBtwCandles = diffBtwCandles / interval_ms;
    var computedIndex = closeInd + offSetValue;
    return {
      targetDate: targetDate,
      index: computedIndex,
      difference: difference,
      offSetValueBtwCandles: offSetValueBtwCandles,
      offSetValue: offSetValue,
      side: side,
      closeInd: closeInd,
      right: right,
      left: left,
      tf: tf
    };
  },
  // WTF with modern web development
  is_mobile: function (w) {
    return 'onorientationchange' in w && (!!navigator.maxTouchPoints || !!navigator.msMaxTouchPoints || 'ontouchstart' in w || w.DocumentTouch && document instanceof w.DocumentTouch);
  }(typeof window !== 'undefined' ? window : {})
});
;// ./src/stuff/math.js
// Math/Geometry

/* harmony default export */ const math = ({
  // Distance from point to line
  // p1 = point, (p2, p3) = line
  point2line: function point2line(p1, p2, p3) {
    var _this$tri = this.tri(p1, p2, p3),
      area = _this$tri.area,
      base = _this$tri.base;
    return Math.abs(this.tri_h(area, base));
  },
  // Distance from point to segment
  // p1 = point, (p2, p3) = segment
  point2seg: function point2seg(p1, p2, p3) {
    var _this$tri2 = this.tri(p1, p2, p3),
      area = _this$tri2.area,
      base = _this$tri2.base;
    // Vector projection
    var proj = this.dot_prod(p1, p2, p3) / base;
    // Distance from left pin
    var l1 = Math.max(-proj, 0);
    // Distance from right pin
    var l2 = Math.max(proj - base, 0);
    // Normal
    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1, l2);
  },
  // Distance from point to ray
  // p1 = point, (p2, p3) = ray
  point2ray: function point2ray(p1, p2, p3) {
    var _this$tri3 = this.tri(p1, p2, p3),
      area = _this$tri3.area,
      base = _this$tri3.base;
    // Vector projection
    var proj = this.dot_prod(p1, p2, p3) / base;
    // Distance from left pin
    var l1 = Math.max(-proj, 0);
    // Normal
    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1);
  },
  tri: function tri(p1, p2, p3) {
    var area = this.area(p1, p2, p3);
    var dx = p3[0] - p2[0];
    var dy = p3[1] - p2[1];
    var base = Math.sqrt(dx * dx + dy * dy);
    return {
      area: area,
      base: base
    };
  },
  /* Area of triangle:
          p1
        /    \
      p2  _  p3
  */
  area: function area(p1, p2, p3) {
    return p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1]);
  },
  // Triangle height
  tri_h: function tri_h(area, base) {
    return area / base;
  },
  // Dot product of (p2, p3) and (p2, p1)
  dot_prod: function dot_prod(p1, p2, p3) {
    var v1 = [p3[0] - p2[0], p3[1] - p2[1]];
    var v2 = [p1[0] - p2[0], p1[1] - p2[1]];
    return v1[0] * v2[0] + v1[1] * v2[1];
  },
  // Symmetrical log
  log: function log(x) {
    // TODO: log for small values
    return Math.sign(x) * Math.log(Math.abs(x) + 1);
  },
  // Symmetrical exp
  exp: function exp(x) {
    return Math.sign(x) * (Math.exp(Math.abs(x)) - 1);
  },
  // Middle line on log scale based on range & px height
  log_mid: function log_mid(r, h) {
    var log_hi = this.log(r[0]);
    var log_lo = this.log(r[1]);
    var px = h / 2;
    var gx = log_hi - px * (log_hi - log_lo) / h;
    return this.exp(gx);
  },
  // Return new adjusted range, based on the previous
  // range, new $_hi, target middle line
  re_range: function re_range(r1, hi2, mid) {
    var log_hi1 = this.log(r1[0]);
    var log_lo1 = this.log(r1[1]);
    var log_hi2 = this.log(hi2);
    var log_$ = this.log(mid);
    var W = (log_hi2 - log_$) * (log_hi1 - log_lo1) / (log_hi1 - log_$);
    return this.exp(log_hi2 - W);
  } // Return new adjusted range, based on the previous
  // range, new $_hi, target middle line + dy (shift)
  // WASTE
  /*range_shift(r1, hi2, mid, dy, h) {
      let log_hi1 = this.log(r1[0])
      let log_lo1 = this.log(r1[1])
      let log_hi2 = this.log(hi2)
      let log_$ = this.log(mid)
        let W = h * (log_hi2 - log_$) /
              (h * (log_hi1 - log_$) / (log_hi1 - log_lo1) + dy)
        return this.exp(log_hi2 - W)
    }*/
});
;// ./src/components/js/layout_fn.js
// Layout functional interface



/* harmony default export */ function layout_fn(self, range) {
  var ib = self.ti_map.ib;
  var dt = range[1] - range[0];
  var r = self.spacex / dt;
  var ls = self.grid.logScale || false;
  Object.assign(self, {
    // Time to screen coordinates
    t2screen: function t2screen(t) {
      if (ib) t = self.ti_map.smth2i(t);
      return Math.floor((t - range[0]) * r) - 0.5;
    },
    // $ to screen coordinates
    $2screen: function $2screen(y) {
      if (ls) y = math.log(y);
      return Math.floor(y * self.A + self.B) - 0.5;
    },
    // Time-axis nearest step
    t_magnet: function t_magnet(t) {
      if (ib) t = self.ti_map.smth2i(t);
      var cn = self.candles || self.master_grid.candles;
      var arr = cn.map(function (x) {
        return x.raw[0];
      });
      var i = utils.nearest_a(t, arr)[0];
      if (!cn[i]) return;
      return Math.floor(cn[i].x) - 0.5;
    },
    // Screen-Y to dollar value (or whatever)
    screen2$: function screen2$(y) {
      if (ls) return math.exp((y - self.B) / self.A);
      return (y - self.B) / self.A;
    },
    // Screen-X to timestamp
    screen2t: function screen2t(x) {
      // TODO: most likely Math.floor not needed
      // return Math.floor(range[0] + x / r)
      return range[0] + x / r;
    },
    // $-axis nearest step
    $_magnet: function $_magnet(price) {},
    // Nearest candlestick
    c_magnet: function c_magnet(t) {
      var cn = self.candles || self.master_grid.candles;
      var arr = cn.map(function (x) {
        return x.raw[0];
      });
      var i = utils.nearest_a(t, arr)[0];
      return cn[i];
    },
    // Nearest data points
    data_magnet: function data_magnet(t) {/* TODO: implement */}
  });
  return self;
}
;// ./src/components/js/log_scale.js
// Log-scale mode helpers

// TODO: all-negative numbers (sometimes wrong scaling)


/* harmony default export */ const log_scale = ({
  candle: function candle(self, mid, p, $p) {
    return {
      x: mid,
      w: self.px_step * $p.config.CANDLEW,
      o: Math.floor(math.log(p[1]) * self.A + self.B),
      h: Math.floor(math.log(p[2]) * self.A + self.B),
      l: Math.floor(math.log(p[3]) * self.A + self.B),
      c: Math.floor(math.log(p[4]) * self.A + self.B),
      raw: p
    };
  },
  expand: function expand(self, height) {
    // expand log scale
    var A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
    var B = -math.log(self.$_hi) * A;
    var top = -height * 0.1;
    var bot = height * 1.1;
    self.$_hi = math.exp((top - B) / A);
    self.$_lo = math.exp((bot - B) / A);
  }
});
;// ./src/components/js/grid_maker.js






var grid_maker_TIMESCALES = constants.TIMESCALES,
  grid_maker_$SCALES = constants.$SCALES,
  grid_maker_WEEK = constants.WEEK,
  grid_maker_MONTH = constants.MONTH,
  grid_maker_YEAR = constants.YEAR,
  grid_maker_HOUR = constants.HOUR,
  grid_maker_DAY = constants.DAY;
var MAX_INT = Number.MAX_SAFE_INTEGER;

// master_grid - ref to the master grid
function GridMaker(id, params, master_grid) {
  if (master_grid === void 0) {
    master_grid = null;
  }
  var sub = params.sub,
    interval = params.interval,
    range = params.range,
    ctx = params.ctx,
    $p = params.$p,
    layers_meta = params.layers_meta,
    height = params.height,
    y_t = params.y_t,
    ti_map = params.ti_map,
    grid = params.grid,
    timezone = params.timezone;
  var self = {
    ti_map: ti_map,
    hideValues: grid.hideValues
  };
  var lm = layers_meta[id];
  var y_range_fn = null;
  var ls = grid.logScale;
  if (lm && Object.keys(lm).length) {
    // Gets last y_range fn()
    var yrs = Object.values(lm).filter(function (x) {
      return x.y_range;
    });
    // The first y_range() determines the range
    if (yrs.length) y_range_fn = yrs[0].y_range;
  }

  // Calc vertical ($/₿) range
  function calc_$range() {
    if (!master_grid) {
      // $ candlestick range
      if (y_range_fn) {
        var _y_range_fn = y_range_fn(hi, lo),
          _y_range_fn2 = _slicedToArray(_y_range_fn, 2),
          hi = _y_range_fn2[0],
          lo = _y_range_fn2[1];
      } else {
        hi = -Infinity, lo = Infinity;
        for (var i = 0, n = sub.length; i < n; i++) {
          var x = sub[i];
          if (x[2] > hi) hi = x[2];
          if (x[3] < lo) lo = x[3];
        }
      }
    } else {
      // Offchart indicator range
      hi = -Infinity, lo = Infinity;
      for (var i = 0; i < sub.length; i++) {
        for (var j = 1; j < sub[i].length; j++) {
          var v = sub[i][j];
          if (v > hi) hi = v;
          if (v < lo) lo = v;
        }
      }
      if (y_range_fn) {
        var _y_range_fn3 = y_range_fn(hi, lo),
          _y_range_fn4 = _slicedToArray(_y_range_fn3, 3),
          hi = _y_range_fn4[0],
          lo = _y_range_fn4[1],
          exp = _y_range_fn4[2];
      }
    }
    // console.log("master_grid",master_grid,y_t)

    // Fixed y-range in non-auto mode
    if (y_t && !y_t.auto && y_t.range) {
      self.$_hi = y_t.range[0];
      self.$_lo = y_t.range[1];
    } else {
      if (!ls) {
        exp = exp === false ? 0 : 1;
        self.$_hi = hi + (hi - lo) * $p.config.EXPAND * exp;
        self.$_lo = lo - (hi - lo) * $p.config.EXPAND * exp;
      } else {
        self.$_hi = hi;
        self.$_lo = lo;
        log_scale.expand(self, height);
      }
      if (self.$_hi === self.$_lo) {
        if (!ls) {
          self.$_hi *= 1.05; // Expand if height range === 0
          self.$_lo *= 0.95;
        } else {
          log_scale.expand(self, height);
        }
      }
    }
  }
  function calc_sidebar() {
    if (sub.length < 2) {
      self.prec = 0;
      self.sb = $p.config.SBMIN;
      return;
    }

    // TODO: improve sidebar width calculation
    // at transition point, when one precision is
    // replaced with another

    // Gets formated levels (their lengths),
    // calculates max and measures the sidebar length
    // from it:

    // TODO: add custom formatter f()

    self.prec = calc_precision(sub);
    var lens = [];
    //lens.push(self.$_hi.toFixed(self.prec).length)
    //lens.push(self.$_lo.toFixed(self.prec).length)
    lens.push(self.$_hi.toFixed(2).length);
    lens.push(self.$_lo.toFixed(2).length);
    var str = '0'.repeat(Math.max.apply(Math, lens)) + '    ';
    self.sb = ctx.measureText(str).width;
    self.sb = Math.max(Math.floor(self.sb), $p.config.SBMIN);
    self.sb = Math.min(self.sb, $p.config.SBMAX);
  }

  // Calculate $ precision for the Y-axis
  function calc_precision(data) {
    var max_r = 0,
      max_l = 0;
    var min = Infinity;
    var max = -Infinity;

    // Speed UP
    for (var i = 0, n = data.length; i < n; i++) {
      var x = data[i];
      if (x[1] > max) max = x[1];else if (x[1] < min) min = x[1];
    }
    // Get max lengths of integer and fractional parts
    [min, max].forEach(function (x) {
      // Fix undefined bug
      var str = x != null ? x.toString() : '';
      if (x < 0.000001) {
        // Parsing the exponential form. Gosh this
        // smells trickily
        var _str$split = str.split('e-'),
          _str$split2 = _slicedToArray(_str$split, 2),
          ls = _str$split2[0],
          rs = _str$split2[1];
        var _ls$split = ls.split('.'),
          _ls$split2 = _slicedToArray(_ls$split, 2),
          l = _ls$split2[0],
          r = _ls$split2[1];
        if (!r) r = '';
        r = {
          length: r.length + parseInt(rs) || 0
        };
      } else {
        var _str$split3 = str.split('.'),
          _str$split4 = _slicedToArray(_str$split3, 2),
          l = _str$split4[0],
          r = _str$split4[1];
      }
      if (r && r.length > max_r) {
        max_r = r.length;
      }
      if (l && l.length > max_l) {
        max_l = l.length;
      }
    });

    // Select precision scheme depending
    // on the left and right part lengths
    //
    var even = max_r - max_r % 2 + 2;
    if (max_l === 1) {
      return Math.min(8, Math.max(2, even));
    }
    if (max_l <= 2) {
      return Math.min(4, Math.max(2, even));
    }
    return 2;
  }
  function calc_positions() {
    if (sub.length < 2) return;
    var dt = range[1] - range[0];

    // A pixel space available to draw on (x-axis)
    self.spacex = $p.width - self.sb;

    // Candle capacity
    var capacity = dt / interval;
    self.px_step = self.spacex / capacity;

    // px / time ratio
    var r = self.spacex / dt;
    self.startx = (sub[0][0] - range[0]) * r;

    // Candle Y-transform: (A = scale, B = shift)
    if (!grid.logScale) {
      self.A = -height / (self.$_hi - self.$_lo);
      self.B = -self.$_hi * self.A;
    } else {
      self.A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
      self.B = -math.log(self.$_hi) * self.A;
    }
  }

  // Select nearest good-loking t step (m is target scale)
  function time_step() {
    var k = ti_map.ib ? 60000 : 1;
    var xrange = (range[1] - range[0]) * k;
    var m = xrange * ($p.config.GRIDX / $p.width);
    var s = grid_maker_TIMESCALES;
    return utils.nearest_a(m, s)[1] / k;
  }

  // Select nearest good-loking $ step (m is target scale)
  function dollar_step() {
    var yrange = self.$_hi - self.$_lo;
    var m = yrange * ($p.config.GRIDY / height);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    var d = Math.pow(10, p);
    var s = grid_maker_$SCALES.map(function (x) {
      return x * d;
    });

    // TODO: center the range (look at RSI for example,
    // it looks ugly when "80" is near the top)
    return utils.strip(utils.nearest_a(m, s)[1]);
  }
  function dollar_mult() {
    var mult_hi = dollar_mult_hi();
    var mult_lo = dollar_mult_lo();
    return Math.max(mult_hi, mult_lo);
  }

  // Price step multiplier (for the log-scale mode)
  function dollar_mult_hi() {
    var h = Math.min(self.B, height);
    if (h < $p.config.GRIDY) return 1;
    var n = h / $p.config.GRIDY; // target grid N
    var yrange = self.$_hi;
    if (self.$_lo > 0) {
      var yratio = self.$_hi / self.$_lo;
    } else {
      yratio = self.$_hi / 1; // TODO: small values
    }
    var m = yrange * ($p.config.GRIDY / h);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    return Math.pow(yratio, 1 / n);
  }
  function dollar_mult_lo() {
    var h = Math.min(height - self.B, height);
    if (h < $p.config.GRIDY) return 1;
    var n = h / $p.config.GRIDY; // target grid N
    var yrange = Math.abs(self.$_lo);
    if (self.$_hi < 0 && self.$_lo < 0) {
      var yratio = Math.abs(self.$_lo / self.$_hi);
    } else {
      yratio = Math.abs(self.$_lo) / 1;
    }
    var m = yrange * ($p.config.GRIDY / h);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    return Math.pow(yratio, 1 / n);
  }
  function grid_x() {
    // If this is a subgrid, no need to calc a timeline,
    // we just borrow it from the master_grid
    if (!master_grid) {
      self.t_step = time_step();
      self.xs = [];
      var dt = range[1] - range[0];
      var r = self.spacex / dt;

      /* TODO: remove the left-side glitch
        let year_0 = Utils.get_year(sub[0][0])
      for (var t0 = year_0; t0 < range[0]; t0 += self.t_step) {}
        let m0 = Utils.get_month(t0)*/

      for (var i = 0; i < sub.length; i++) {
        var p = sub[i];
        var prev = sub[i - 1] || [];
        var prev_xs = self.xs[self.xs.length - 1] || [0, []];
        var x = Math.floor((p[0] - range[0]) * r);
        insert_line(prev, p, x);

        // Filtering lines that are too near
        var xs = self.xs[self.xs.length - 1] || [0, []];
        if (prev_xs === xs) continue;
        if (xs[1][0] - prev_xs[1][0] < self.t_step * 0.8) {
          // prev_xs is a higher "rank" label
          if (xs[2] <= prev_xs[2]) {
            self.xs.pop();
          } else {
            // Otherwise
            self.xs.splice(self.xs.length - 2, 1);
          }
        }
      }

      // TODO: fix grid extension for bigger timeframes
      if (interval < grid_maker_WEEK && r > 0) {
        extend_left(dt, r);
        extend_right(dt, r);
      }
    } else {
      self.t_step = master_grid.t_step;
      self.px_step = master_grid.px_step;
      self.startx = master_grid.startx;
      self.xs = master_grid.xs;
    }
  }
  function insert_line(prev, p, x, m0) {
    var prev_t = ti_map.ib ? ti_map.i2t(prev[0]) : prev[0];
    var p_t = ti_map.ib ? ti_map.i2t(p[0]) : p[0];
    if (ti_map.tf < grid_maker_DAY) {
      prev_t += timezone * grid_maker_HOUR;
      p_t += timezone * grid_maker_HOUR;
    }
    var d = timezone * grid_maker_HOUR;

    // TODO: take this block =========> (see below)
    if ((prev[0] || interval === grid_maker_YEAR) && utils.get_year(p_t) !== utils.get_year(prev_t)) {
      self.xs.push([x, p, grid_maker_YEAR]); // [px, [...], rank]
    } else if (prev[0] && utils.get_month(p_t) !== utils.get_month(prev_t)) {
      self.xs.push([x, p, grid_maker_MONTH]);
    }
    // TODO: should be added if this day !== prev day
    // And the same for 'botbar.js', TODO(*)
    else if (utils.day_start(p_t) === p_t) {
      self.xs.push([x, p, grid_maker_DAY]);
    } else if (p[0] % self.t_step === 0) {
      self.xs.push([x, p, interval]);
    }
  }
  function extend_left(dt, r) {
    if (!self.xs.length || !isFinite(r)) return;
    var t = self.xs[0][1][0];
    while (true) {
      t -= self.t_step;
      var x = Math.floor((t - range[0]) * r);
      if (x < 0) break;
      // TODO: ==========> And insert it here somehow
      if (t % interval === 0) {
        self.xs.unshift([x, [t], interval]);
      }
    }
  }
  function extend_right(dt, r) {
    if (!self.xs.length || !isFinite(r)) return;
    var t = self.xs[self.xs.length - 1][1][0];
    while (true) {
      t += self.t_step;
      var x = Math.floor((t - range[0]) * r);
      if (x > self.spacex) break;
      if (t % interval === 0) {
        self.xs.push([x, [t], interval]);
      }
    }
  }
  function grid_y() {
    // Prevent duplicate levels
    var m = Math.pow(10, -self.prec);
    self.$_step = Math.max(m, dollar_step());
    self.ys = [];
    var y1 = self.$_lo - self.$_lo % self.$_step;
    for (var y$ = y1; y$ <= self.$_hi; y$ += self.$_step) {
      var y = Math.floor(y$ * self.A + self.B);
      if (y > height) continue;
      if (!self.hideValues) self.ys.push([y, utils.strip(y$)]);
    }
  }
  function grid_y_log() {
    // TODO: Prevent duplicate levels, is this even
    // a problem here ?
    self.$_mult = dollar_mult();
    self.ys = [];
    if (!sub.length) return;
    var v = Math.abs(sub[sub.length - 1][1] || 1);
    var y1 = search_start_pos(v);
    var y2 = search_start_neg(-v);
    var yp = -Infinity; // Previous y value
    var n = height / $p.config.GRIDY; // target grid N

    var q = 1 + (self.$_mult - 1) / 2;

    // Over 0
    for (var y$ = y1; y$ > 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);
      var y = Math.floor(math.log(y$) * self.A + self.B);
      self.ys.push([y, utils.strip(y$)]);
      if (y > height) break;
      if (y - yp < $p.config.GRIDY * 0.7) break;
      if (self.ys.length > n + 1) break;
      yp = y;
    }

    // Under 0
    yp = Infinity;
    for (var y$ = y2; y$ < 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);
      var _y = Math.floor(math.log(y$) * self.A + self.B);
      if (yp - _y < $p.config.GRIDY * 0.7) break;
      self.ys.push([_y, utils.strip(y$)]);
      if (_y < 0) break;
      if (self.ys.length > n * 3 + 1) break;
      yp = _y;
    }

    // TODO: remove lines near to 0
  }

  // Search a start for the top grid so that
  // the fixed value always included
  function search_start_pos(value) {
    var N = height / $p.config.GRIDY; // target grid N
    var y = Infinity,
      y$ = value,
      count = 0;
    while (y > 0) {
      y = Math.floor(math.log(y$) * self.A + self.B);
      y$ *= self.$_mult;
      if (count++ > N * 3) return 0; // Prevents deadloops
    }
    return y$;
  }
  function search_start_neg(value) {
    var N = height / $p.config.GRIDY; // target grid N
    var y = -Infinity,
      y$ = value,
      count = 0;
    while (y < height) {
      y = Math.floor(math.log(y$) * self.A + self.B);
      y$ *= self.$_mult;
      if (count++ > N * 3) break; // Prevents deadloops
    }
    return y$;
  }

  // Make log scale levels look great again
  function log_rounder(x, quality) {
    var s = Math.sign(x);
    x = Math.abs(x);
    if (x > 10) {
      for (var div = 10; div < MAX_INT; div *= 10) {
        var nice = Math.floor(x / div) * div;
        if (x / nice > quality) {
          // More than 10% off
          break;
        }
      }
      div /= 10;
      return s * Math.floor(x / div) * div;
    } else if (x < 1) {
      for (var ro = 10; ro >= 1; ro--) {
        var _nice = utils.round(x, ro);
        if (x / _nice > quality) {
          // More than 10% off
          break;
        }
      }
      return s * utils.round(x, ro + 1);
    } else {
      return s * Math.floor(x);
    }
  }
  function apply_sizes() {
    self.width = $p.width - self.sb;
    self.height = height;
  }
  calc_$range();
  calc_sidebar();
  return {
    // First we need to calculate max sidebar width
    // (among all grids). Then we can actually make
    // them
    create: function create() {
      calc_positions();
      grid_x();
      if (grid.logScale) {
        grid_y_log();
      } else {
        grid_y();
      }
      apply_sizes();

      // Link to the master grid (candlesticks)
      if (master_grid) {
        self.master_grid = master_grid;
      }
      self.grid = grid; // Grid params

      // Here we add some helpful functions for
      // plugin creators
      return layout_fn(self, range);
    },
    get_layout: function get_layout() {
      return self;
    },
    set_sidebar: function set_sidebar(v) {
      return self.sb = v;
    },
    get_sidebar: function get_sidebar() {
      return self.sb;
    }
  };
}
/* harmony default export */ const grid_maker = (GridMaker);
;// ./src/components/js/layout.js


function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = layout_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function layout_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return layout_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? layout_arrayLikeToArray(r, a) : void 0; } }
function layout_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Calculates all necessary s*it to build the chart
// Heights, widths, transforms, ... = everything
// Why such a mess you ask? Well, that's because
// one components size can depend on other component
// data formatting (e.g. grid width depends on sidebar precision)
// So it's better to calc all in one place.





function Layout(params) {
  var chart = params.chart,
    sub = params.sub,
    offsub = params.offsub,
    interval = params.interval,
    range = params.range,
    ctx = params.ctx,
    layers_meta = params.layers_meta,
    ti_map = params.ti_map,
    $p = params.$props,
    y_ts = params.y_transforms;
  var mgrid = chart.grid || {};
  offsub = offsub.filter(function (x, i) {
    // Skip offchart overlays with custom grid id,
    // because they will be mergred with the existing grids
    return !(x.grid && x.grid.id);
  });

  // Splits space between main chart
  // and offchart indicator grids
  function grid_hs() {
    var height = $p.height - $p.config.BOTBAR;

    // When at least one height defined (default = 1),
    // Pxs calculated as: (sum of weights) / number
    if (mgrid.height || offsub.find(function (x) {
      return x.grid.height;
    })) {
      return weighted_hs(mgrid, height);
    }
    var n = offsub.length;
    var off_h = 2 * Math.sqrt(n) / 7 / (n || 1);

    // Offchart grid height
    var px = Math.floor(height * off_h);

    // Main grid height
    var m = height - px * n;
    return [m].concat(Array(n).fill(px));
  }
  function weighted_hs(grid, height) {
    var hs = [{
      grid: grid
    }].concat(_toConsumableArray(offsub)).map(function (x) {
      return x.grid.height || 1;
    });
    var sum = hs.reduce(function (a, b) {
      return a + b;
    }, 0);
    hs = hs.map(function (x) {
      return Math.floor(x / sum * height);
    });

    // Refine the height if Math.floor decreased px sum
    sum = hs.reduce(function (a, b) {
      return a + b;
    }, 0);
    for (var i = 0; i < height - sum; i++) hs[i % hs.length]++;
    return hs;
  }
  function candles_n_vol() {
    self.candles = [];
    self.volume = [];
    var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
      return x[5];
    })));
    var vs = $p.config.VOLSCALE * $p.height / maxv;
    var x1,
      x2,
      mid,
      prev = undefined;
    var splitter = self.px_step > 5 ? 1 : 0;
    var hf_px_step = self.px_step * 0.5;
    for (var i = 0; i < sub.length; i++) {
      var p = sub[i];
      mid = self.t2screen(p[0]) + 0.5;
      self.candles.push(mgrid.logScale ? log_scale.candle(self, mid, p, $p) : {
        x: mid,
        w: self.px_step * $p.config.CANDLEW,
        o: Math.floor(p[1] * self.A + self.B),
        h: Math.floor(p[2] * self.A + self.B),
        l: Math.floor(p[3] * self.A + self.B),
        c: Math.floor(p[4] * self.A + self.B),
        raw: p
      });
      // Clear volume bar if there is a time gap
      if (sub[i - 1] && p[0] - sub[i - 1][0] > interval) {
        prev = null;
      }
      x1 = prev || Math.floor(mid - hf_px_step);
      x2 = Math.floor(mid + hf_px_step) - 0.5;
      self.volume.push({
        x1: x1,
        x2: x2,
        h: p[5] * vs,
        green: p[4] >= p[1],
        raw: p
      });
      prev = x2 + splitter;
    }
  }

  // Main grid
  var hs = grid_hs();
  var specs = {
    sub: sub,
    interval: interval,
    range: range,
    ctx: ctx,
    $p: $p,
    layers_meta: layers_meta,
    ti_map: ti_map,
    height: hs[0],
    y_t: y_ts[0],
    grid: mgrid,
    timezone: $p.timezone
  };
  var gms = [new grid_maker(0, specs)];

  // Sub grids
  var _iterator = _createForOfIteratorHelper(offsub.entries()),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
        i = _step$value[0],
        _step$value$ = _step$value[1],
        data = _step$value$.data,
        grid = _step$value$.grid;
      specs.sub = data;
      specs.height = hs[i + 1];
      specs.y_t = y_ts[i + 1];
      specs.grid = grid || {};
      gms.push(new grid_maker(i + 1, specs, gms[0].get_layout()));
    }

    // Max sidebar among all grinds
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var sb = Math.max.apply(Math, _toConsumableArray(gms.map(function (x) {
    return x.get_sidebar();
  })));
  var grids = [],
    offset = 0;
  for (i = 0; i < gms.length; i++) {
    gms[i].set_sidebar(sb);
    grids.push(gms[i].create());
    grids[i].id = i;
    grids[i].offset = offset;
    offset += grids[i].height;
  }
  var self = grids[0];
  candles_n_vol();
  return {
    grids: grids,
    botbar: {
      width: $p.width,
      height: $p.config.BOTBAR,
      offset: offset,
      xs: grids[0] ? grids[0].xs : []
    }
  };
}
/* harmony default export */ const layout = (Layout);
;// ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js
function classCallCheck_classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}

;// ./node_modules/@babel/runtime/helpers/esm/typeof.js
function typeof_typeof(o) {
  "@babel/helpers - typeof";

  return typeof_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, typeof_typeof(o);
}

;// ./node_modules/@babel/runtime/helpers/esm/toPrimitive.js

function toPrimitive(t, r) {
  if ("object" != typeof_typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof_typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}

;// ./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js


function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == typeof_typeof(i) ? i : i + "";
}

;// ./node_modules/@babel/runtime/helpers/esm/createClass.js

function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
  }
}
function createClass_createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}

;// ./src/components/js/updater.js



function updater_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = updater_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function updater_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return updater_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? updater_arrayLikeToArray(r, a) : void 0; } }
function updater_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Cursor updater: calculates current values for
// OHLCV and all other indicators


var CursorUpdater = /*#__PURE__*/function () {
  function CursorUpdater(comp) {
    classCallCheck_classCallCheck(this, CursorUpdater);
    this.comp = comp, this.grids = comp._layout.grids, this.cursor = comp.cursor;
  }
  return createClass_createClass(CursorUpdater, [{
    key: "sync",
    value: function sync(e) {
      // TODO: values not displaying if a custom grid id is set:
      // grid: { id: N }
      this.cursor.grid_id = e.grid_id;
      var once = true;
      var _iterator = updater_createForOfIteratorHelper(this.grids),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var grid = _step.value;
          var c = this.cursor_data(grid, e);
          if (!this.cursor.locked) {
            // TODO: find a better fix to invisible cursor prob
            if (once) {
              this.cursor.t = this.cursor_time(grid, e, c);
              if (this.cursor.t) once = false;
            }
            if (c.values) {
              this.comp.$set(this.cursor.values, grid.id, c.values);
            }
          }
          if (grid.id !== e.grid_id) continue;
          this.cursor.x = grid.t2screen(this.cursor.t);
          this.cursor.y = c.y;
          this.cursor.y$ = c.y$;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "overlay_data",
    value: function overlay_data(grid, e) {
      var s = grid.id === 0 ? 'main_section' : 'sub_section';
      var data = this.comp[s].data;

      // Split offchart data between offchart grids
      if (grid.id > 0) {
        // Sequential grids
        var _d = data.filter(function (x) {
          return x.grid.id === undefined;
        });
        // grids with custom ids (for merging)
        var m = data.filter(function (x) {
          return x.grid.id === grid.id;
        });
        data = [_d[grid.id - 1]].concat(_toConsumableArray(m));
      }
      var t = grid.screen2t(e.x);
      var ids = {},
        res = {};
      var _iterator2 = updater_createForOfIteratorHelper(data),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var d = _step2.value;
          var ts = d.data.map(function (x) {
            return x[0];
          });
          var i = utils.nearest_a(t, ts)[0];
          d.type in ids ? ids[d.type]++ : ids[d.type] = 0;
          res["".concat(d.type, "_").concat(ids[d.type])] = d.data[i];
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return res;
    }

    // Nearest datapoints
  }, {
    key: "cursor_data",
    value: function cursor_data(grid, e) {
      var data = this.comp.main_section.sub;
      var xs = data.map(function (x) {
        return grid.t2screen(x[0]) + 0.5;
      });
      var i = utils.nearest_a(e.x, xs)[0];
      if (!xs[i]) return {};
      return {
        x: Math.floor(xs[i]) - 0.5,
        y: Math.floor(e.y - 2) - 0.5 - grid.offset,
        y$: grid.screen2$(e.y - 2 - grid.offset),
        t: (data[i] || [])[0],
        values: Object.assign({
          ohlcv: grid.id === 0 ? data[i] : undefined
        }, this.overlay_data(grid, e))
      };
    }

    // Get cursor t-position (extended)
  }, {
    key: "cursor_time",
    value: function cursor_time(grid, mouse, candle) {
      var t = grid.screen2t(mouse.x);
      var r = Math.abs((t - candle.t) / this.comp.interval);
      var sign = Math.sign(t - candle.t);
      if (r >= 0.5) {
        // Outside the data range
        var n = Math.round(r);
        return candle.t + n * this.comp.interval * sign;
      }
      // Inside the data range
      return candle.t;
    }
  }]);
}();
/* harmony default export */ const updater = (CursorUpdater);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=template&id=4a517028
var Sectionvue_type_template_id_4a517028_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', [_c('title-chart-legend', {
    ref: "legend",
    attrs: {
      "values": _vm.section_values,
      "decimalPlace": _vm.decimalPlace,
      "legendDecimal": _vm.legendDecimal,
      "grid_id": _vm.grid_id,
      "common": _vm.legend_props,
      "meta_props": _vm.get_meta_props,
      "showTitleChartLegend": _vm.showTitleChartLegend
    },
    on: {
      "legend-button-click": _vm.button_click
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "trading-vue-section"
  }, [_c('chart-legend', {
    ref: "legend",
    attrs: {
      "values": _vm.section_values,
      "decimalPlace": _vm.decimalPlace,
      "legendDecimal": _vm.legendDecimal,
      "grid_id": _vm.grid_id,
      "common": _vm.legend_props,
      "meta_props": _vm.get_meta_props,
      "showTitleChartLegend": _vm.showTitleChartLegend,
      "isOverlayCollapsed": _vm.isOverlayCollapsed,
      "collpaseButton": _vm.collpaseButton
    },
    on: {
      "legend-button-click": _vm.button_click,
      "on-collapse-change": _vm.collapse_button_click
    }
  }), _vm._v(" "), _c('grid', _vm._b({
    ref: "grid",
    attrs: {
      "grid_id": _vm.grid_id,
      "enableZoom": _vm.enableZoom,
      "decimalPlace": _vm.decimalPlace,
      "priceLine": _vm.priceLine,
      "enableCrosshair": _vm.enableCrosshair,
      "tv_id": _vm.tv_id
    },
    on: {
      "register-kb-listener": _vm.register_kb,
      "remove-kb-listener": _vm.remove_kb,
      "range-changed": _vm.range_changed,
      "cursor-changed": _vm.cursor_changed,
      "cursor-locked": _vm.cursor_locked,
      "layer-meta-props": _vm.emit_meta_props,
      "custom-event": _vm.emit_custom_event,
      "sidebar-transform": _vm.sidebar_transform,
      "rezoom-range": _vm.rezoom_range
    }
  }, 'grid', _vm.grid_props, false)), _vm._v(" "), _c('sidebar', _vm._b({
    ref: 'sb-' + _vm.grid_id,
    attrs: {
      "grid_id": _vm.grid_id,
      "rerender": _vm.rerender,
      "decimalPlace": _vm.decimalPlace,
      "applyShaders": _vm.applyShaders,
      "enableSideBarBoxValue": _vm.enableSideBarBoxValue
    },
    on: {
      "sidebar-transform": _vm.sidebar_transform
    }
  }, 'sidebar', _vm.sidebar_props, false))], 1)], 1);
};
var Sectionvue_type_template_id_4a517028_staticRenderFns = [];
Sectionvue_type_template_id_4a517028_render._withStripped = true;

;// ./src/components/Section.vue?vue&type=template&id=4a517028

;// ./src/stuff/frame.js


// Annimation frame with a fallback for
// slower devices


var FrameAnimation = /*#__PURE__*/function () {
  function FrameAnimation(cb) {
    var _this = this;
    classCallCheck_classCallCheck(this, FrameAnimation);
    this.t0 = this.t = utils.now();
    this.id = setInterval(function () {
      // The prev frame took too long
      if (utils.now() - _this.t > 100) return;
      if (utils.now() - _this.t0 > 1200) {
        _this.stop();
      }
      if (_this.id) cb(_this);
      _this.t = utils.now();
    }, 16);
  }
  return createClass_createClass(FrameAnimation, [{
    key: "stop",
    value: function stop() {
      clearInterval(this.id);
      this.id = null;
    }
  }]);
}();

// EXTERNAL MODULE: ./node_modules/hammerjs/hammer.js
var hammer = __webpack_require__(168);
// EXTERNAL MODULE: ./node_modules/hamsterjs/hamster.js
var hamster = __webpack_require__(240);
var hamster_default = /*#__PURE__*/__webpack_require__.n(hamster);
;// ./src/components/js/grid.js




function grid_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = grid_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function grid_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return grid_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? grid_arrayLikeToArray(r, a) : void 0; } }
function grid_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Grid.js listens to various user-generated events,
// emits Vue-events if something has changed (e.g. range)
// Think of it as an I/O system for Grid.vue







// Grid is good.
var Grid = /*#__PURE__*/function () {
  function Grid(canvas, comp) {
    classCallCheck_classCallCheck(this, Grid);
    this.MIN_ZOOM = comp.config.MIN_ZOOM;
    this.MAX_ZOOM = comp.config.MAX_ZOOM;
    if (utils.is_mobile) this.MIN_ZOOM *= 0.5;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.id = this.$p.grid_id;
    this.layout = this.$p.layout.grids[this.id];
    this.interval = this.$p.interval;
    this.cursor = comp.$props.cursor;
    this.offset_x = 0;
    this.offset_y = 0;
    this.deltas = 0; // Wheel delta events
    this.wmode = this.$p.config.SCROLL_WHEEL;
    // if (this.$p.enableZoom) {
    this.listeners();
    // }
    this.overlays = [];
  }
  return createClass_createClass(Grid, [{
    key: "listeners",
    value: function listeners() {
      var _this = this;
      //console.log(this.$p.enableZoom);
      this.hm = hamster_default()(this.canvas);
      if (this.$p.enableZoom) {
        this.hm.wheel(function (event, delta) {
          return _this.mousezoom(-delta * 50, event);
        });
      }
      var mc = this.mc = new hammer.Manager(this.canvas);
      var T = utils.is_mobile ? 10 : 0;
      mc.add(new hammer.Pan({
        threshold: T
      }));
      mc.add(new hammer.Tap());
      mc.add(new hammer.Pinch({
        threshold: 0
      }));
      mc.get("pinch").set({
        enable: true
      });
      if (utils.is_mobile) mc.add(new hammer.Press());
      mc.on("panstart", function (event) {
        if (_this.cursor.scroll_lock) return;
        if (_this.cursor.mode === "aim") {
          return _this.emit_cursor_coord(event);
        }
        var tfrm = _this.$p.y_transform;
        _this.drug = {
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y,
          r: _this.range.slice(),
          t: _this.range[1] - _this.range[0],
          o: tfrm ? tfrm.offset || 0 : 0,
          y_r: tfrm && tfrm.range ? tfrm.range.slice() : undefined,
          B: _this.layout.B,
          t0: utils.now()
        };
        _this.comp.$emit("cursor-changed", {
          grid_id: _this.id,
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y
        });
        _this.comp.$emit("cursor-locked", true);
      });
      mc.on("panmove", function (event) {
        if (utils.is_mobile) {
          console.log("panmove event mobile");
          _this.calc_offset();
          _this.propagate("mousemove", _this.touch2mouse(event));
        }
        if (_this.drug) {
          if (_this.$p.enableZoom) {
            console.log("panmove event if block");
            _this.mousedrag(_this.drug.x + event.deltaX, _this.drug.y + event.deltaY);
            _this.comp.$emit("cursor-changed", {
              grid_id: _this.id,
              x: event.center.x + _this.offset_x,
              y: event.center.y + _this.offset_y
            });
          }
        } else if (_this.cursor.mode === "aim") {
          _this.emit_cursor_coord(event);
        }
      });
      mc.on("panend", function (event) {
        if (utils.is_mobile && _this.drug) {
          _this.pan_fade(event);
        }
        _this.drug = null;
        _this.comp.$emit("cursor-locked", false);
      });
      mc.on("tap", function (event) {
        if (!utils.is_mobile) return;
        _this.sim_mousedown(event);
        if (_this.fade) _this.fade.stop();
        _this.comp.$emit("cursor-changed", {});
        _this.comp.$emit("cursor-changed", {
          /*grid_id: this.id,
                  x: undefined,//event.center.x + this.offset_x,
                  y: undefined,//event.center.y + this.offset_y,*/
          mode: "explore"
        });
        _this.update();
      });
      mc.on("pinchstart", function () {
        _this.drug = null;
        _this.pinch = {
          t: _this.range[1] - _this.range[0],
          r: _this.range.slice()
        };
      });
      mc.on("pinchend", function () {
        _this.pinch = null;
      });
      mc.on("pinch", function (event) {
        if (_this.$p.enableZoom) {
          if (_this.pinch) _this.pinchzoom(event.scale);
        }
      });
      mc.on("press", function (event) {
        if (!utils.is_mobile) return;
        if (_this.fade) _this.fade.stop();
        _this.calc_offset();
        _this.emit_cursor_coord(event, {
          mode: "aim"
        });
        setTimeout(function () {
          return _this.update();
        });
        _this.sim_mousedown(event);
      });
      var add = addEventListener;
      add("gesturestart", this.gesturestart);
      add("gesturechange", this.gesturechange);
      add("gestureend", this.gestureend);
    }
  }, {
    key: "gesturestart",
    value: function gesturestart(event) {
      event.preventDefault();
    }
  }, {
    key: "gesturechange",
    value: function gesturechange(event) {
      event.preventDefault();
    }
  }, {
    key: "gestureend",
    value: function gestureend(event) {
      event.preventDefault();
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      if (utils.is_mobile) return;
      this.comp.$emit("cursor-changed", {
        grid_id: this.id,
        x: event.layerX,
        y: event.layerY + this.layout.offset
      });
      this.calc_offset();
      this.propagate("mousemove", event);
    }
  }, {
    key: "mouseout",
    value: function mouseout(event) {
      if (utils.is_mobile) return;
      this.comp.$emit("cursor-changed", {});
      this.propagate("mouseout", event);
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      this.drug = null;
      this.comp.$emit("cursor-locked", false);
      this.propagate("mouseup", event);
    }
  }, {
    key: "mousedown",
    value: function mousedown(event) {
      if (utils.is_mobile) return;
      this.propagate("mousedown", event);
      this.comp.$emit("cursor-locked", true);
      if (event.defaultPrevented) return;
      this.comp.$emit("custom-event", {
        event: "grid-mousedown",
        args: [this.id, event]
      });
    }

    // Simulated mousedown (for mobile)
  }, {
    key: "sim_mousedown",
    value: function sim_mousedown(event) {
      var _this2 = this;
      if (event.srcEvent.defaultPrevented) return;
      this.comp.$emit("custom-event", {
        event: "grid-mousedown",
        args: [this.id, event]
      });
      this.propagate("mousemove", this.touch2mouse(event));
      this.update();
      this.propagate("mousedown", this.touch2mouse(event));
      setTimeout(function () {
        _this2.propagate("click", _this2.touch2mouse(event));
      });
    }

    // Convert touch to "mouse" event
  }, {
    key: "touch2mouse",
    value: function touch2mouse(e) {
      this.calc_offset();
      return {
        original: e.srcEvent,
        layerX: e.center.x + this.offset_x,
        layerY: e.center.y + this.offset_y,
        preventDefault: function preventDefault() {
          this.original.preventDefault();
        }
      };
    }
  }, {
    key: "click",
    value: function click(event) {
      this.propagate("click", event);
    }
  }, {
    key: "emit_cursor_coord",
    value: function emit_cursor_coord(event, add) {
      if (add === void 0) {
        add = {};
      }
      this.comp.$emit("cursor-changed", Object.assign({
        grid_id: this.id,
        x: event.center.x + this.offset_x,
        y: event.center.y + this.offset_y + this.layout.offset
      }, add));
    }
  }, {
    key: "pan_fade",
    value: function pan_fade(event) {
      var _this3 = this;
      var dt = utils.now() - this.drug.t0;
      var dx = this.range[1] - this.drug.r[1];
      var v = 42 * dx / dt;
      var v0 = Math.abs(v * 0.01);
      if (dt > 500) return;
      if (this.fade) this.fade.stop();
      this.fade = new FrameAnimation(function (self) {
        v *= 0.85;
        if (Math.abs(v) < v0) {
          self.stop();
        }
        _this3.range[0] += v;
        _this3.range[1] += v;
        _this3.change_range();
      });
    }
  }, {
    key: "calc_offset",
    value: function calc_offset() {
      var rect = this.canvas.getBoundingClientRect();
      this.offset_x = -rect.x;
      this.offset_y = -rect.y;
    }
  }, {
    key: "new_layer",
    value: function new_layer(layer) {
      if (layer.name === "crosshair") {
        this.crosshair = layer;
      } else {
        this.overlays.push(layer);
      }
      this.update();
    }
  }, {
    key: "del_layer",
    value: function del_layer(id) {
      this.overlays = this.overlays.filter(function (x) {
        return x.id !== id;
      });
      this.update();
    }
  }, {
    key: "show_hide_layer",
    value: function show_hide_layer(event) {
      var l = this.overlays.filter(function (x) {
        return x.id === event.id;
      });
      if (l.length) l[0].display = event.display;
    }
  }, {
    key: "update",
    value: function update() {
      var _this4 = this;
      // Update reference to the grid
      // TODO: check what happens if data changes interval
      this.layout = this.$p.layout.grids[this.id];
      this.interval = this.$p.interval;
      if (!this.layout) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.$p.shaders.length) this.apply_shaders();
      this.grid();
      var overlays = [];
      overlays.push.apply(overlays, _toConsumableArray(this.overlays));

      // z-index sorting
      overlays.sort(function (l1, l2) {
        return l1.z - l2.z;
      });
      if (overlays.map(function (x) {
        return x.renderer.drag;
      }).some(function (y) {
        return y != null || y != undefined;
      })) {
        this.ctx.canvas.style.cursor = 'grabbing';
      } else if (overlays.map(function (x) {
        return x.renderer.show_pins;
      }).some(function (y) {
        return y === true;
      })) {
        this.ctx.canvas.style.cursor = 'pointer';
      } else {
        this.ctx.canvas.style.cursor = 'default';
      }
      overlays.forEach(function (l) {
        if (!l.display) return;
        _this4.ctx.save();
        var r = l.renderer;
        if (r.pre_draw) r.pre_draw(_this4.ctx);
        r.draw(_this4.ctx);
        if (r.post_draw) r.post_draw(_this4.ctx);
        _this4.ctx.restore();
      });
      if (this.crosshair) {
        this.crosshair.renderer.draw(this.ctx);
      }
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.$p.layout.grids[this.id];
      var props = {
        layout: layout,
        range: this.range,
        interval: this.interval,
        tf: layout.ti_map.tf,
        cursor: this.cursor,
        colors: this.$p.colors,
        sub: this.data,
        font: this.$p.font,
        config: this.$p.config,
        meta: this.$p.meta
      };
      var _iterator = grid_createForOfIteratorHelper(this.$p.shaders),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var s = _step.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    // Actually draws the grid (for real)
  }, {
    key: "grid",
    value: function grid() {
      this.ctx.strokeStyle = this.$p.colors.grid;
      this.ctx.beginPath();
      var ymax = this.layout.height;
      // for (var [x, p] of this.layout.xs) {
      //
      //     this.ctx.moveTo(x - 0.5, 0)
      //     this.ctx.lineTo(x - 0.5, ymax)
      //
      // }
      var _iterator2 = grid_createForOfIteratorHelper(this.layout.ys),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            y = _step2$value[0],
            y$ = _step2$value[1];
          this.ctx.moveTo(0, y - 0.5);
          this.ctx.lineTo(this.layout.width, y - 0.5);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.ctx.stroke();
      if (this.$p.grid_id) this.upper_border();
    }
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    }
  }, {
    key: "mousezoom",
    value: function mousezoom(delta, event) {
      // TODO: for mobile
      if (this.wmode !== "pass") {
        if (this.wmode === "click" && !this.$p.meta.activated) {
          return;
        }
        event.originalEvent.preventDefault();
        event.preventDefault();
      }
      event.deltaX = event.deltaX || utils.get_deltaX(event);
      event.deltaY = event.deltaY || utils.get_deltaY(event);
      if (Math.abs(event.deltaX) > 0) {
        this.trackpad = true;
        if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
          delta *= 0.1;
        }
        this.trackpad_scroll(event);
      }
      if (this.trackpad) delta *= 0.032;
      delta = utils.smart_wheel(delta);

      // TODO: mouse zooming is a little jerky,
      // needs to follow f(mouse_wheel_speed) and
      // if speed is low, scroll shoud be slower
      if (delta < 0 && this.data.length <= this.MIN_ZOOM) return;
      if (delta > 0 && this.data.length > this.MAX_ZOOM) return;
      var k = this.interval / 1000;
      var diff = delta * k * this.data.length;
      var tl = this.comp.config.ZOOM_MODE === "tl";
      if (event.originalEvent.ctrlKey || tl) {
        var offset = event.originalEvent.offsetX;
        var diff1 = offset / (this.canvas.width - 1) * diff;
        var diff2 = diff - diff1;
        this.range[0] -= diff1;
        this.range[1] += diff2;
      } else {
        this.range[0] -= diff;
      }
      if (tl) {
        var _offset = event.originalEvent.offsetY;
        var _diff = _offset / (this.canvas.height - 1) * 2;
        var _diff2 = 2 - _diff;
        var z = diff / (this.range[1] - this.range[0]);
        //rezoom_range(z, diff_x, diff_y)
        this.comp.$emit("rezoom-range", {
          grid_id: this.id,
          z: z,
          diff1: _diff,
          diff2: _diff2
        });
      }
      this.change_range();
    }
  }, {
    key: "mousedrag",
    value: function mousedrag(x, y) {
      var dt = this.drug.t * (this.drug.x - x) / this.layout.width;
      var d$ = this.layout.$_hi - this.layout.$_lo;
      d$ *= (this.drug.y - y) / this.layout.height;
      var offset = this.drug.o + d$;
      var ls = this.layout.grid.logScale;
      if (ls && this.drug.y_r) {
        var dy = this.drug.y - y;
        var range = this.drug.y_r.slice();
        range[0] = math.exp((0 - this.drug.B + dy) / this.layout.A);
        range[1] = math.exp((this.layout.height - this.drug.B + dy) / this.layout.A);
      }
      if (this.drug.y_r && this.$p.y_transform && !this.$p.y_transform.auto) {
        this.comp.$emit("sidebar-transform", {
          grid_id: this.id,
          range: ls ? range || this.drug.y_r : [this.drug.y_r[0] - offset, this.drug.y_r[1] - offset]
        });
      }
      this.range[0] = this.drug.r[0] + dt;
      this.range[1] = this.drug.r[1] + dt;
      this.change_range();
    }
  }, {
    key: "pinchzoom",
    value: function pinchzoom(scale) {
      if (scale > 1 && this.data.length <= this.MIN_ZOOM) return;
      if (scale < 1 && this.data.length > this.MAX_ZOOM) return;
      var t = this.pinch.t;
      var nt = t * 1 / scale;
      this.range[0] = this.pinch.r[0] - (nt - t) * 0.5;
      this.range[1] = this.pinch.r[1] + (nt - t) * 0.5;
      this.change_range();
    }
  }, {
    key: "trackpad_scroll",
    value: function trackpad_scroll(event) {
      var dt = this.range[1] - this.range[0];
      this.range[0] += event.deltaX * dt * 0.011;
      this.range[1] += event.deltaX * dt * 0.011;
      this.change_range();
    }
  }, {
    key: "change_range",
    value: function change_range() {
      // TODO: better way to limit the view. Problem:
      // when you are at the dead end of the data,
      // and keep scrolling,
      // the chart continues to scale down a little.
      // Solution: I don't know yet

      if (!this.range.length || this.data.length < 2) return;
      var l = this.data.length - 1;
      var data = this.data;
      var range = this.range;
      range[0] = utils.clamp(range[0], -Infinity, data[l][0] - this.interval * 5.5);
      range[1] = utils.clamp(range[1], data[0][0] + this.interval * 5.5, Infinity);

      // TODO: IMPORTANT scrolling is jerky The Problem caused
      // by the long round trip of 'range-changed' event.
      // First it propagates up to update layout in Chart.vue,
      // then it moves back as watch() update. It takes 1-5 ms.
      // And because the delay is different each time we see
      // the lag. No smooth movement and it's annoying.
      // Solution: we could try to calc the layout immediatly
      // somewhere here. Still will hurt the sidebar & bottombar
      this.comp.$emit("range-changed", range, true);
    }

    // Propagate mouse event to overlays
  }, {
    key: "propagate",
    value: function propagate(name, event) {
      var _iterator3 = grid_createForOfIteratorHelper(this.overlays),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var layer = _step3.value;
          if (layer.renderer[name]) {
            layer.renderer[name](event);
          }
          var mouse = layer.renderer.mouse;
          var keys = layer.renderer.keys;
          if (mouse.listeners) {
            mouse.emit(name, event);
          }
          if (keys && keys.listeners) {
            keys.emit(name, event);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var rm = removeEventListener;
      rm("gesturestart", this.gesturestart);
      rm("gesturechange", this.gesturechange);
      rm("gestureend", this.gestureend);
      if (this.mc) this.mc.destroy();
      if (this.hm) this.hm.unwheel();
    }
  }]);
}();

;// ./src/mixins/canvas.js
// Interactive canvas-based component
// Should implement: mousemove, mouseout, mouseup, mousedown, click


/* harmony default export */ const canvas = ({
  methods: {
    setup: function setup() {
      var _this = this;
      var id = "".concat(this.$props.tv_id, "-").concat(this._id, "-canvas");
      var canvas = document.getElementById(id);
      var dpr = window.devicePixelRatio || 1;
      canvas.style.width = "".concat(this._attrs.width, "px");
      canvas.style.height = "".concat(this._attrs.height, "px");
      if (dpr < 1) dpr = 1; // Realy ? That's it? Issue #63
      this.$nextTick(function () {
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        var ctx = canvas.getContext('2d', {
          // TODO: test the boost:
          //alpha: false,
          //desynchronized: true,
          //preserveDrawingBuffer: false
        });
        ctx.scale(dpr, dpr);
        _this.redraw();
        // Fallback fix for Brave browser
        // https://github.com/brave/brave-browser/issues/1738
        if (!ctx.measureTextOrg) {
          ctx.measureTextOrg = ctx.measureText;
        }
        ctx.measureText = function (text) {
          return utils.measureText(ctx, text, _this.$props.tv_id);
        };
      });
    },
    create_canvas: function create_canvas(h, id, props) {
      var _this2 = this;
      this._id = id;
      this._attrs = props.attrs;
      return h('div', {
        "class": "trading-vue-canvas trading-vue-".concat(id),
        style: {
          left: props.position.x + 'px',
          top: props.position.y + 'px',
          position: 'absolute'
        }
      }, [h('canvas', {
        on: {
          mousemove: function mousemove(e) {
            return _this2.renderer.mousemove(e);
          },
          mouseout: function mouseout(e) {
            return _this2.renderer.mouseout(e);
          },
          mouseup: function mouseup(e) {
            return _this2.renderer.mouseup(e);
          },
          mousedown: function mousedown(e) {
            return _this2.renderer.mousedown(e);
          }
        },
        attrs: Object.assign({
          id: "".concat(this.$props.tv_id, "-").concat(id, "-canvas")
        }, props.attrs),
        ref: 'canvas',
        style: props.style
      })].concat(props.hs || []));
    },
    redraw: function redraw() {
      if (!this.renderer) return;
      this.renderer.update();
    }
  },
  watch: {
    width: function width(val) {
      this._attrs.width = val;
      this.setup();
    },
    height: function height(val) {
      this._attrs.height = val;
      this.setup();
    }
  }
});
;// ./src/mixins/uxlist.js
// Manager for Inteerface objects

/* harmony default export */ const uxlist = ({
  methods: {
    on_ux_event: function on_ux_event(d, target) {
      if (d.event === 'new-interface') {
        if (d.args[0].target === target) {
          d.args[0].vars = d.args[0].vars || {};
          d.args[0].grid_id = d.args[1];
          d.args[0].overlay_id = d.args[2];
          this.uxs.push(d.args[0]);
          // this.rerender++
        }
      } else if (d.event === 'close-interface') {
        this.uxs = this.uxs.filter(function (x) {
          return x.uuid !== d.args[0];
        });
      } else if (d.event === 'modify-interface') {
        var ux = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (ux.length) {
          this.modify(ux[0], d.args[1]);
        }
      } else if (d.event === 'hide-interface') {
        var _ux = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (_ux.length) {
          _ux[0].hidden = true;
          this.modify(_ux[0], {
            hidden: true
          });
        }
      } else if (d.event === 'show-interface') {
        var _ux2 = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (_ux2.length) {
          this.modify(_ux2[0], {
            hidden: false
          });
        }
      } else {
        return d;
      }
    },
    modify: function modify(ux, obj) {
      if (obj === void 0) {
        obj = {};
      }
      for (var k in obj) {
        if (k in ux) {
          this.$set(ux, k, obj[k]);
        }
      }
    },
    // Remove all UXs for a given overlay id
    remove_all_ux: function remove_all_ux(id) {
      this.uxs = this.uxs.filter(function (x) {
        return x.overlay.id !== id;
      });
    }
  },
  data: function data() {
    return {
      uxs: []
    };
  }
});
;// ./src/components/js/crosshair.js


var Crosshair = /*#__PURE__*/function () {
  function Crosshair(comp) {
    classCallCheck_classCallCheck(this, Crosshair);
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this._visible = false;
    this.locked = false;
    this.layout = this.$p.layout;
    this.enableCrosshair = this.$p.enableCrosshair;
  }
  return createClass_createClass(Crosshair, [{
    key: "draw",
    value: function draw(ctx) {
      // Update reference to the grid
      this.layout = this.$p.layout;
      var cursor = this.comp.$props.cursor;
      // console.log(this.vis)
      if (!this.visible && cursor.mode === 'explore') return;
      this.x = this.$p.cursor.x;
      this.y = this.$p.cursor.y;
      ctx.save();
      ctx.strokeStyle = this.$p.colors.cross;
      ctx.beginPath();
      ctx.setLineDash([5]);

      // H
      if (this.$p.cursor.grid_id === this.layout.id) {
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.layout.width - 0.5, this.y);
      }

      // V
      ctx.moveTo(this.x, 0);
      ctx.lineTo(this.x, this.layout.height);
      if (this.enableCrosshair) {
        ctx.stroke();
      }
      ctx.restore();
    }
  }, {
    key: "hide",
    value: function hide() {
      this.visible = false;
      this.x = undefined;
      this.y = undefined;
    }
  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(val) {
      this._visible = val;
    }
  }]);
}();

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Crosshair.vue?vue&type=script&lang=js


/* harmony default export */ const Crosshairvue_type_script_lang_js = ({
  name: 'Crosshair',
  props: ['cursor', 'colors', 'layout', 'sub', 'enableCrosshair'],
  watch: {
    cursor: {
      handler: function handler() {
        if (!this.ch) this.create();

        // Explore = default mode on mobile
        var cursor = this.$props.cursor;
        var explore = cursor.mode === 'explore';
        if (!cursor.x || !cursor.y) {
          this.ch.hide();
          this.$emit('redraw-grid');
          return;
        }
        this.ch.visible = !explore;
      },
      deep: true
    },
    enableCrosshair: {
      handler: function handler(n) {
        this.create();
      }
    }
  },
  methods: {
    create: function create() {
      this.ch = new Crosshair(this);

      // New grid overlay-renderer descriptor.
      // Should implement draw() (see Spline.vue)
      this.$emit('new-grid-layer', {
        name: 'crosshair',
        renderer: this.ch
      });
    }
  },
  render: function render(h) {
    return h();
  }
});
;// ./src/components/Crosshair.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Crosshairvue_type_script_lang_js = (Crosshairvue_type_script_lang_js); 
;// ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent(
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */,
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options =
    typeof scriptExports === 'function' ? scriptExports.options : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) {
    // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
          injectStyles.call(
            this,
            (options.functional ? this.parent : this).$root.$options.shadowRoot
          )
        }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

;// ./src/components/Crosshair.vue
var Crosshair_render, Crosshair_staticRenderFns
;



/* normalize component */
;
var component = normalizeComponent(
  components_Crosshairvue_type_script_lang_js,
  Crosshair_render,
  Crosshair_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Crosshair = (component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/KeyboardListener.vue?vue&type=script&lang=js
/* harmony default export */ const KeyboardListenervue_type_script_lang_js = ({
  name: 'KeyboardListener',
  created: function created() {
    this.$emit('register-kb-listener', {
      id: this._uid,
      keydown: this.keydown,
      keyup: this.keyup,
      keypress: this.keypress
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.$emit('remove-kb-listener', {
      id: this._uid
    });
  },
  methods: {
    keydown: function keydown(event) {
      this.$emit('keydown', event);
    },
    keyup: function keyup(event) {
      this.$emit('keyup', event);
    },
    keypress: function keypress(event) {
      this.$emit('keypress', event);
    }
  },
  render: function render(h) {
    return h();
  }
});
;// ./src/components/KeyboardListener.vue?vue&type=script&lang=js
 /* harmony default export */ const components_KeyboardListenervue_type_script_lang_js = (KeyboardListenervue_type_script_lang_js); 
;// ./src/components/KeyboardListener.vue
var KeyboardListener_render, KeyboardListener_staticRenderFns
;



/* normalize component */
;
var KeyboardListener_component = normalizeComponent(
  components_KeyboardListenervue_type_script_lang_js,
  KeyboardListener_render,
  KeyboardListener_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const KeyboardListener = (KeyboardListener_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=template&id=15e2a3ac
var UxLayervue_type_template_id_15e2a3ac_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('span', {
    "class": "trading-vue-grid-ux-".concat(_vm.id),
    style: _vm.style
  }, _vm._l(_vm.uxs, function (ux) {
    return _c('ux-wrapper', {
      key: ux.uuid,
      attrs: {
        "ux": ux,
        "updater": _vm.updater,
        "colors": _vm.colors,
        "config": _vm.config
      },
      on: {
        "custom-event": _vm.on_custom_event
      }
    });
  }), 1);
};
var UxLayervue_type_template_id_15e2a3ac_staticRenderFns = [];
UxLayervue_type_template_id_15e2a3ac_render._withStripped = true;

;// ./src/components/UxLayer.vue?vue&type=template&id=15e2a3ac

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=template&id=5c211b12
var UxWrappervue_type_template_id_5c211b12_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _vm.visible ? _c('div', {
    staticClass: "trading-vue-ux-wrapper",
    style: _vm.style,
    attrs: {
      "id": "tvjs-ux-wrapper-".concat(_vm.ux.uuid)
    }
  }, [_c(_vm.ux.component, {
    tag: "component",
    attrs: {
      "ux": _vm.ux,
      "updater": _vm.updater,
      "wrapper": _vm.wrapper,
      "colors": _vm.colors
    },
    on: {
      "custom-event": _vm.on_custom_event
    }
  }), _vm._v(" "), _vm.ux.show_pin ? _c('div', {
    staticClass: "tvjs-ux-wrapper-pin",
    style: _vm.pin_style
  }) : _vm._e(), _vm._v(" "), _vm.ux.win_header !== false ? _c('div', {
    staticClass: "tvjs-ux-wrapper-head"
  }, [_c('div', {
    staticClass: "tvjs-ux-wrapper-close",
    style: _vm.btn_style,
    on: {
      "click": _vm.close
    }
  }, [_vm._v("×")])]) : _vm._e()], 1) : _vm._e();
};
var UxWrappervue_type_template_id_5c211b12_staticRenderFns = [];
UxWrappervue_type_template_id_5c211b12_render._withStripped = true;

;// ./src/components/UxWrapper.vue?vue&type=template&id=5c211b12

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=script&lang=js

/* harmony default export */ const UxWrappervue_type_script_lang_js = ({
  name: 'UxWrapper',
  props: ['ux', 'updater', 'colors', 'config'],
  data: function data() {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      visible: true
    };
  },
  computed: {
    uxr: function uxr() {
      return this.$props.ux; // just a ref
    },
    layout: function layout() {
      return this.$props.ux.overlay.layout;
    },
    settings: function settings() {
      return this.$props.ux.overlay.settings;
    },
    uuid: function uuid() {
      return "tvjs-ux-wrapper-".concat(this.uxr.uuid);
    },
    mouse: function mouse() {
      return this.uxr.overlay.mouse;
    },
    style: function style() {
      var st = {
        'display': this.uxr.hidden ? 'none' : undefined,
        'left': "".concat(this.x, "px"),
        'top': "".concat(this.y, "px"),
        'pointer-events': this.uxr.pointer_events || 'all',
        'z-index': this.z_index
      };
      if (this.uxr.win_styling !== false) st = Object.assign(st, {
        'border': "1px solid ".concat(this.$props.colors.grid),
        'border-radius': '3px',
        'background': "".concat(this.background)
      });
      return st;
    },
    pin_style: function pin_style() {
      return {
        'left': "".concat(-this.ox, "px"),
        'top': "".concat(-this.oy, "px"),
        'background-color': this.uxr.pin_color
      };
    },
    btn_style: function btn_style() {
      return {
        'background': "".concat(this.inactive_btn_color),
        'color': "".concat(this.inactive_btn_color)
      };
    },
    pin_pos: function pin_pos() {
      return this.uxr.pin_position ? this.uxr.pin_position.split(',') : ['0', '0'];
    },
    // Offset x
    ox: function ox() {
      if (this.pin_pos.length !== 2) return undefined;
      var x = this.parse_coord(this.pin_pos[0], this.w);
      return -x;
    },
    // Offset y
    oy: function oy() {
      if (this.pin_pos.length !== 2) return undefined;
      var y = this.parse_coord(this.pin_pos[1], this.h);
      return -y;
    },
    z_index: function z_index() {
      var base_index = this.settings['z-index'] || this.settings['zIndex'] || 0;
      var ux_index = this.uxr['z_index'] || 0;
      return base_index + ux_index;
    },
    background: function background() {
      var c = this.uxr.background || this.$props.colors.back;
      return utils.apply_opacity(c, this.uxr.background_opacity || this.$props.config.UX_OPACITY);
    },
    inactive_btn_color: function inactive_btn_color() {
      return this.uxr.inactive_btn_color || this.$props.colors.grid;
    },
    wrapper: function wrapper() {
      return {
        x: this.x,
        y: this.y,
        pin_x: this.x - this.ox,
        pin_y: this.y - this.oy
      };
    }
  },
  watch: {
    updater: function updater() {
      this.update_position();
    }
  },
  mounted: function mounted() {
    this.self = document.getElementById(this.uuid);
    this.w = this.self.offsetWidth; // TODO: => width: "content"
    this.h = this.self.offsetHeight; // TODO: => height: "content"
    this.update_position();
  },
  created: function created() {
    this.mouse.on('mousemove', this.mousemove);
    this.mouse.on('mouseout', this.mouseout);
  },
  beforeDestroy: function beforeDestroy() {
    this.mouse.off('mousemove', this.mousemove);
    this.mouse.off('mouseout', this.mouseout);
  },
  methods: {
    update_position: function update_position() {
      if (this.uxr.hidden) return;
      var lw = this.layout.width;
      var lh = this.layout.height;
      var pin = this.uxr.pin;
      switch (pin[0]) {
        case 'cursor':
          var x = this.uxr.overlay.cursor.x;
          break;
        case 'mouse':
          x = this.mouse.x;
          break;
        default:
          if (typeof pin[0] === 'string') {
            x = this.parse_coord(pin[0], lw);
          } else {
            x = this.layout.t2screen(pin[0]);
          }
      }
      switch (pin[1]) {
        case 'cursor':
          var y = this.uxr.overlay.cursor.y;
          break;
        case 'mouse':
          y = this.mouse.y;
          break;
        default:
          if (typeof pin[1] === 'string') {
            y = this.parse_coord(pin[1], lh);
          } else {
            y = this.layout.$2screen(pin[1]);
          }
      }
      this.x = x + this.ox;
      this.y = y + this.oy;
    },
    parse_coord: function parse_coord(str, scale) {
      str = str.trim();
      if (str === '0' || str === '') return 0;
      var plus = str.split('+');
      if (plus.length === 2) {
        return this.parse_coord(plus[0], scale) + this.parse_coord(plus[1], scale);
      }
      var minus = str.split('-');
      if (minus.length === 2) {
        return this.parse_coord(minus[0], scale) - this.parse_coord(minus[1], scale);
      }
      var per = str.split('%');
      if (per.length === 2) {
        return scale * parseInt(per[0]) / 100;
      }
      var px = str.split('px');
      if (px.length === 2) {
        return parseInt(px[0]);
      }
      return undefined;
    },
    mousemove: function mousemove() {
      this.update_position();
      this.visible = true;
    },
    mouseout: function mouseout() {
      if (this.uxr.pin.includes('cursor') || this.uxr.pin.includes('mouse')) this.visible = false;
    },
    on_custom_event: function on_custom_event(event) {
      this.$emit('custom-event', event);
      if (event.event === 'modify-interface') {
        if (this.self) {
          this.w = this.self.offsetWidth;
          this.h = this.self.offsetHeight;
        }
        this.update_position();
      }
    },
    close: function close() {
      this.$emit('custom-event', {
        event: 'close-interface',
        args: [this.$props.ux.uuid]
      });
    }
  }
});
;// ./src/components/UxWrapper.vue?vue&type=script&lang=js
 /* harmony default export */ const components_UxWrappervue_type_script_lang_js = (UxWrappervue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=style&index=0&id=5c211b12&prod&lang=css
var UxWrappervue_type_style_index_0_id_5c211b12_prod_lang_css = __webpack_require__(392);
;// ./src/components/UxWrapper.vue?vue&type=style&index=0&id=5c211b12&prod&lang=css

;// ./src/components/UxWrapper.vue



;


/* normalize component */

var UxWrapper_component = normalizeComponent(
  components_UxWrappervue_type_script_lang_js,
  UxWrappervue_type_template_id_5c211b12_render,
  UxWrappervue_type_template_id_5c211b12_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const UxWrapper = (UxWrapper_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=script&lang=js

/* harmony default export */ const UxLayervue_type_script_lang_js = ({
  name: 'UxLayer',
  components: {
    UxWrapper: UxWrapper
  },
  props: ['tv_id', 'id', 'uxs', 'updater', 'colors', 'config'],
  computed: {
    style: function style() {
      return {
        'top': this.$props.id !== 0 ? '1px' : 0,
        'left': 0,
        'width': '100%',
        'height': 'calc(100% - 2px)',
        'position': 'absolute',
        'z-index': '1',
        'pointer-events': 'none',
        'overflow': 'hidden'
      };
    }
  },
  created: function created() {},
  mounted: function mounted() {},
  beforeDestroy: function beforeDestroy() {},
  methods: {
    on_custom_event: function on_custom_event(event) {
      this.$emit('custom-event', event);
    }
  }
});
;// ./src/components/UxLayer.vue?vue&type=script&lang=js
 /* harmony default export */ const components_UxLayervue_type_script_lang_js = (UxLayervue_type_script_lang_js); 
;// ./src/components/UxLayer.vue





/* normalize component */
;
var UxLayer_component = normalizeComponent(
  components_UxLayervue_type_script_lang_js,
  UxLayervue_type_template_id_15e2a3ac_render,
  UxLayervue_type_template_id_15e2a3ac_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const UxLayer = (UxLayer_component.exports);
;// ./src/stuff/mouse.js


function mouse_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = mouse_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function mouse_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return mouse_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? mouse_arrayLikeToArray(r, a) : void 0; } }
function mouse_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Mouse event handler for overlay
var Mouse = /*#__PURE__*/function () {
  function Mouse(comp) {
    classCallCheck_classCallCheck(this, Mouse);
    this.comp = comp;
    this.map = {};
    this.listeners = 0;
    this.pressed = false;
    this.x = comp.$props.cursor.x;
    this.y = comp.$props.cursor.y;
    this.t = comp.$props.cursor.t;
    this.y$ = comp.$props.cursor.y$;
  }

  // You can choose where to place the handler
  // (beginning or end of the queue)
  return createClass_createClass(Mouse, [{
    key: "on",
    value: function on(name, handler, dir) {
      if (dir === void 0) {
        dir = 'unshift';
      }
      if (!handler) return;
      this.map[name] = this.map[name] || [];
      this.map[name][dir](handler);
      this.listeners++;
    }
  }, {
    key: "off",
    value: function off(name, handler) {
      if (!this.map[name]) return;
      var i = this.map[name].indexOf(handler);
      if (i < 0) return;
      this.map[name].splice(i, 1);
      this.listeners--;
    }

    // Called by grid.js
  }, {
    key: "emit",
    value: function emit(name, event) {
      var l = this.comp.layout;
      if (name in this.map) {
        var _iterator = mouse_createForOfIteratorHelper(this.map[name]),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var f = _step.value;
            f(event);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      if (name === 'mousemove') {
        this.x = event.layerX;
        this.y = event.layerY;
        this.t = l.screen2t(this.x);
        this.y$ = l.screen2$(this.y);
      }
      if (name === 'mousedown') {
        this.pressed = true;
      }
      if (name === 'mouseup') {
        this.pressed = false;
      }
    }
  }]);
}();

;// ./src/mixins/overlay.js
// Usuful stuff for creating overlays. Include as mixin


/* harmony default export */ const overlay = ({
  props: ['id', 'num', 'interval', 'cursor', 'colors', 'layout', 'sub', 'data', 'settings', 'grid_id', 'font', 'config', 'meta', 'tf', 'i0', 'last'],
  mounted: function mounted() {
    // TODO(1): when hot reloading, dynamicaly changed mixins
    // dissapear (cuz it's a hack), the only way for now
    // is to reload the browser
    if (!this.draw) {
      this.draw = function (ctx) {
        var text = 'EARLY ADOPTER BUG: reload the browser & enjoy';
        console.warn(text);
      };
    }
    // Main chart?
    var main = this.$props.sub === this.$props.data;
    this.meta_info();

    // TODO(1): quick fix for vue2, in vue3 we use 3rd party emit
    try {
      new Function('return ' + this.$emit)();
      this._$emit = this.$emit;
      this.$emit = this.custom_event;
    } catch (e) {
      return;
    }
    this._$emit('new-grid-layer', {
      name: this.$options.name,
      id: this.$props.id,
      renderer: this,
      display: 'display' in this.$props.settings ? this.$props.settings['display'] : true,
      z: this.$props.settings['z-index'] || this.$props.settings['zIndex'] || (main ? 0 : -1)
    });

    // Overlay meta-props (adjusting behaviour)
    this._$emit('layer-meta-props', {
      grid_id: this.$props.grid_id,
      layer_id: this.$props.id,
      legend: this.legend,
      data_colors: this.data_colors,
      y_range: this.y_range
    });
    this.exec_script();
    this.mouse = new Mouse(this);
    if (this.init_tool) this.init_tool();
    if (this.init) this.init();
  },
  beforeDestroy: function beforeDestroy() {
    if (this.destroy) this.destroy();
    this._$emit('delete-grid-layer', this.$props.id);
  },
  methods: {
    use_for: function use_for() {
      /* override it (mandatory) */
      console.warn('use_for() should be implemented');
      console.warn("Format: use_for() {\n                  return ['type1', 'type2', ...]\n            }");
    },
    meta_info: function meta_info() {
      /* override it (optional) */
      var id = this.$props.id;
      console.warn("".concat(id, " meta_info() is req. for publishing"));
      console.warn("Format: meta_info() {\n                author: 'Satoshi Smith',\n                version: '1.0.0',\n                contact (opt) '<email>'\n                github: (opt) '<GitHub Page>',\n            }");
    },
    custom_event: function custom_event(event) {
      if (event.split(':')[0] === 'hook') return;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      if (event === 'change-settings' || event === 'object-selected' || event === 'new-shader' || event === 'new-interface' || event === 'remove-tool') {
        args.push(this.grid_id, this.id);
        if (this.$props.settings.$uuid) {
          args.push(this.$props.settings.$uuid);
        }
        // console.log("overlay custom event",event,args)
      }
      if (event === 'new-interface') {
        args[0].overlay = this;
        args[0].uuid = this.last_ux_id = "".concat(this.grid_id, "-").concat(this.id, "-").concat(this.uxs_count++);
      }
      // TODO: add a namespace to the event name
      // TODO(2): this prevents call overflow, but
      // the root of evil is in (1)
      if (event === 'custom-event') return;
      // console.log('custom-event',{event, args})
      this._$emit('custom-event', {
        event: event,
        args: args
      });
    },
    // TODO: the event is not firing when the same
    // overlay type is added to the offchart[]
    exec_script: function exec_script() {
      if (this.calc) this.$emit('exec-script', {
        grid_id: this.$props.grid_id,
        layer_id: this.$props.id,
        src: this.calc(),
        use_for: this.use_for()
      });
    }
  },
  watch: {
    settings: {
      handler: function handler(n, p) {
        // console.log('watch_uuid',this.watch_uuid,n)
        if (this.watch_uuid) this.watch_uuid(n, p);
        this._$emit('show-grid-layer', {
          id: this.$props.id,
          display: 'display' in this.$props.settings ? this.$props.settings['display'] : true
        });
      },
      deep: true
    }
  },
  data: function data() {
    return {
      uxs_count: 0,
      last_ux_id: null
    };
  },
  render: function render(h) {
    return h();
  }
});
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Spline.vue?vue&type=script&lang=js
// Spline renderer. (SMAs, EMAs, TEMAs...
// you know what I mean)
// TODO: make a real spline, not a bunch of lines...

// Adds all necessary stuff for you.

/* harmony default export */ const Splinevue_type_script_lang_js = ({
  name: 'Spline',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    line_type: function line_type() {
      return "lineType" in this.sett ? this.sett.lineType : "solid";
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    },
    data_index: function data_index() {
      return this.sett.dataIndex || 1;
    },
    // Don't connect separate parts if true
    skip_nan: function skip_nan() {
      return this.sett.skipNaN;
    },
    noidea: function noidea() {
      return 12;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.2'
      };
    },
    // Here goes your code. You are provided with:
    // { All stuff is reactive }
    // $props.layout -> positions of all chart elements +
    //  some helper functions (see layout_fn.js)
    // $props.interval -> candlestick time interval
    // $props.sub -> current subset of candlestick data
    // $props.data -> your indicator's data subset.
    //  Comes "as is", should have the following format:
    //  [[<timestamp>, ... ], ... ]
    // $props.colors -> colors (see TradingVue.vue)
    // $props.cursor -> current position of crosshair
    // $props.settings -> indicator's custom settings
    //  E.g. colors, line thickness, etc. You define it.
    // $props.num -> indicator's layer number (of All
    // layers in the current grid)
    // $props.id -> indicator's id (e.g. EMA_0)
    // ~
    // Finally, let's make the canvas dirty!
    draw: function draw(ctx) {
      ctx.lineWidth = this.line_width;
      // console.log("this.line_type",this.line_type)
      ctx.strokeStyle = this.color;
      ctx.beginPath();

      //--- line style
      if (this.line_type === 'dashed') {
        ctx.setLineDash([5, 10]);
      } else if (this.line_type === 'dotted') {
        ctx.setLineDash([3, 4]);
      }
      var layout = this.$props.layout;
      var i = this.data_index;
      var data = this.$props.data;
      if (!this.skip_nan) {
        for (var k = 0, n = data.length; k < n; k++) {
          var p = data[k];
          var x = layout.t2screen(p[0]);
          var y = layout.$2screen(p[i]);
          ctx.lineTo(x, y);
        }
      } else {
        var skip = false;
        for (var k = 0, n = data.length; k < n; k++) {
          var _p = data[k];
          var _x = layout.t2screen(_p[0]);
          var _y = layout.$2screen(_p[i]);
          if (_p[i] == null || _y !== _y) {
            skip = true;
          } else {
            if (skip) ctx.moveTo(_x, _y);
            ctx.lineTo(_x, _y);
            skip = false;
          }
        }
      }
      ctx.stroke();
    },
    // For all data with these types overlay will be
    // added to the renderer list. And '$props.data'
    // will have the corresponding values. If you want to
    // redefine the default behviour for a prticular
    // indicator (let's say EMA),
    // just create a new overlay with the same type:
    // e.g. use_for() { return ['EMA'] }.
    use_for: function use_for() {
      return ['Spline', 'EMA', 'SMA'];
    },
    // Colors for the legend, should have the
    // same dimention as a data point (excl. timestamp)
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  mounted: function mounted() {
    //console.log("Spline Mounted")
  }
});
;// ./src/components/overlays/Spline.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Splinevue_type_script_lang_js = (Splinevue_type_script_lang_js); 
;// ./src/components/overlays/Spline.vue
var Spline_render, Spline_staticRenderFns
;



/* normalize component */
;
var Spline_component = normalizeComponent(
  overlays_Splinevue_type_script_lang_js,
  Spline_render,
  Spline_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Spline = (Spline_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Splines.vue?vue&type=script&lang=js
// Channel renderer. (Keltner, Bollinger)

/* harmony default export */ const Splinesvue_type_script_lang_js = ({
  name: 'Splines',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    widths: function widths() {
      return this.sett.lineWidths || [];
    },
    clrx: function clrx() {
      var colors = this.sett.colors || [];
      var n = this.$props.num;
      if (!colors.length) {
        for (var i = 0; i < this.lines_num; i++) {
          colors.push(this.COLORS[(n + i) % 5]);
        }
      }
      return colors;
    },
    lines_num: function lines_num() {
      if (!this.$props.data[0]) return 0;
      return this.$props.data[0].length - 1;
    },
    // Don't connect separate parts if true
    skip_nan: function skip_nan() {
      return this.sett.skipNaN;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    draw: function draw(ctx) {
      for (var i = 0; i < this.lines_num; i++) {
        var _i = i % this.clrx.length;
        ctx.strokeStyle = this.clrx[_i];
        ctx.lineWidth = this.widths[i] || this.line_width;
        ctx.beginPath();
        this.draw_spline(ctx, i);
        ctx.stroke();
      }
    },
    draw_spline: function draw_spline(ctx, i) {
      var layout = this.$props.layout;
      var data = this.$props.data;
      if (!this.skip_nan) {
        for (var k = 0, n = data.length; k < n; k++) {
          var p = data[k];
          var x = layout.t2screen(p[0]);
          var y = layout.$2screen(p[i + 1]);
          ctx.lineTo(x, y);
        }
      } else {
        var skip = false;
        for (var k = 0, n = data.length; k < n; k++) {
          var _p = data[k];
          var _x = layout.t2screen(_p[0]);
          var _y = layout.$2screen(_p[i + 1]);
          if (_p[i + 1] == null || _y !== _y) {
            skip = true;
          } else {
            if (skip) ctx.moveTo(_x, _y);
            ctx.lineTo(_x, _y);
            skip = false;
          }
        }
      }
    },
    use_for: function use_for() {
      return ['Splines', 'DMI'];
    },
    data_colors: function data_colors() {
      return this.clrx;
    }
  }
});
;// ./src/components/overlays/Splines.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Splinesvue_type_script_lang_js = (Splinesvue_type_script_lang_js); 
;// ./src/components/overlays/Splines.vue
var Splines_render, Splines_staticRenderFns
;



/* normalize component */
;
var Splines_component = normalizeComponent(
  overlays_Splinesvue_type_script_lang_js,
  Splines_render,
  Splines_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Splines = (Splines_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Range.vue?vue&type=script&lang=js
// R S I . Because we love it

// Adds all necessary stuff for you.

/* harmony default export */ const Rangevue_type_script_lang_js = ({
  name: 'Range',
  mixins: [overlay],
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      return this.sett.color || '#ec206e';
    },
    band_color: function band_color() {
      return this.sett.bandColor || '#ddd';
    },
    back_color: function back_color() {
      return this.sett.backColor || '#381e9c16';
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    // Here goes your code. You are provided with:
    // { All stuff is reactive }
    // $props.layout -> positions of all chart elements +
    //  some helper functions (see layout_fn.js)
    // $props.interval -> candlestick time interval
    // $props.sub -> current subset of candlestick data
    // $props.data -> your indicator's data subset.
    //  Comes "as is", should have the following format:
    //  [[<timestamp>, ... ], ... ]
    // $props.colors -> colors (see TradingVue.vue)
    // $props.cursor -> current position of crosshair
    // $props.settings -> indicator's custom settings
    //  E.g. colors, line thickness, etc. You define it.
    // $props.num -> indicator's layer number (of All
    // layers in the current grid)
    // $props.id -> indicator's id (e.g. EMA_0)
    // ~
    // Finally, let's make the canvas dirty!
    draw: function draw(ctx) {
      var layout = this.$props.layout;
      var upper = layout.$2screen(this.sett.upper || 70);
      var lower = layout.$2screen(this.sett.lower || 30);
      var data = this.$props.data;

      // RSI values

      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      for (var k = 0, n = data.length; k < n; k++) {
        var p = data[k];
        var x = layout.t2screen(p[0]);
        var y = layout.$2screen(p[1]);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = this.band_color;
      ctx.setLineDash([5]); // Will be removed after draw()
      ctx.beginPath();

      // Fill the area between the bands
      ctx.fillStyle = this.back_color;
      ctx.fillRect(0, upper, layout.width, lower - upper);

      // Upper band
      ctx.moveTo(0, upper);
      ctx.lineTo(layout.width, upper);

      // Lower band
      ctx.moveTo(0, lower);
      ctx.lineTo(layout.width, lower);
      ctx.stroke();
    },
    // For all data with these types overlay will be
    // added to the renderer list. And '$props.data'
    // will have the corresponding values. If you want to
    // redefine the default behviour for a prticular
    // indicator (let's say EMA),
    // just create a new overlay with the same type:
    // e.g. use_for() { return ['EMA'] }.
    use_for: function use_for() {
      return ['Range', 'RSI'];
    },
    // Colors for the legend, should have the
    // same dimention as a data point (excl. timestamp)
    data_colors: function data_colors() {
      return [this.color];
    },
    // Y-Range tansform. For example you need a fixed
    // Y-range for an indicator, you can do it here!
    // Gets estimated range, @return you favorite range
    y_range: function y_range(hi, lo) {
      return [Math.max(hi, this.sett.upper || 70), Math.min(lo, this.sett.lower || 30)];
    }
  }
});
;// ./src/components/overlays/Range.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Rangevue_type_script_lang_js = (Rangevue_type_script_lang_js); 
;// ./src/components/overlays/Range.vue
var Range_render, Range_staticRenderFns
;



/* normalize component */
;
var Range_component = normalizeComponent(
  overlays_Rangevue_type_script_lang_js,
  Range_render,
  Range_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Range = (Range_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Trades.vue?vue&type=script&lang=js

/* harmony default export */ const Tradesvue_type_script_lang_js = ({
  name: 'Trades',
  mixins: [overlay],
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    default_font: function default_font() {
      return '12px ' + this.$props.font.split('px').pop();
    },
    buy_color: function buy_color() {
      return this.sett.buyColor || '#63df89';
    },
    sell_color: function sell_color() {
      return this.sett.sellColor || '#ec4662';
    },
    label_color: function label_color() {
      return this.sett.labelColor || '#999';
    },
    marker_size: function marker_size() {
      return this.sett.markerSize || 5;
    },
    show_label: function show_label() {
      return this.sett.showLabel !== false;
    },
    new_font: function new_font() {
      return this.sett.font || this.default_font;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.2'
      };
    },
    draw: function draw(ctx) {
      var layout = this.$props.layout;
      var data = this.$props.data;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'black';
      for (var k = 0, n = data.length; k < n; k++) {
        var p = data[k];
        ctx.fillStyle = p[1] ? this.buy_color : this.sell_color;
        ctx.beginPath();
        var x = layout.t2screen(p[0]); // x - Mapping
        var y = layout.$2screen(p[2]); // y - Mapping
        ctx.arc(x, y, this.marker_size + 0.5, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        if (this.show_label && p[3]) {
          this.draw_label(ctx, x, y, p);
        }
      }
    },
    draw_label: function draw_label(ctx, x, y, p) {
      ctx.fillStyle = this.label_color;
      ctx.font = this.new_font;
      ctx.textAlign = 'center';
      ctx.fillText(p[3], x, y - 25);
    },
    use_for: function use_for() {
      return ['Trades'];
    },
    // Defines legend format (values & colors)
    legend: function legend(values) {
      switch (values[1]) {
        case 0:
          var pos = 'Sell';
          break;
        case 1:
          pos = 'Buy';
          break;
        default:
          pos = 'Unknown';
      }
      return [{
        value: pos
      }, {
        value: values[2].toFixed(4),
        color: this.$props.colors.text
      }].concat(values[3] ? [{
        value: values[3]
      }] : []);
    }
  }
});
;// ./src/components/overlays/Trades.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Tradesvue_type_script_lang_js = (Tradesvue_type_script_lang_js); 
;// ./src/components/overlays/Trades.vue
var Trades_render, Trades_staticRenderFns
;



/* normalize component */
;
var Trades_component = normalizeComponent(
  overlays_Tradesvue_type_script_lang_js,
  Trades_render,
  Trades_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Trades = (Trades_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Channel.vue?vue&type=script&lang=js
// Channel renderer. (Keltner, Bollinger)
// TODO: allow color transparency
// TODO: improve performance: draw in one solid chunk

/* harmony default export */ const Channelvue_type_script_lang_js = ({
  name: 'Channel',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    },
    show_mid: function show_mid() {
      return 'showMid' in this.sett ? this.sett.showMid : true;
    },
    back_color: function back_color() {
      return this.sett.backColor || this.color + '11';
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    /*draw(ctx) {
        ctx.lineWidth = this.line_width
        ctx.strokeStyle = this.color
        ctx.fillStyle = this.back_color
          for (var i = 0; i < this.$props.data.length - 1; i++) {
                let p1 = this.mapp(this.$props.data[i])
            let p2 = this.mapp(this.$props.data[i+1])
              if (!p2) continue
            if (p1.y1 !== p1.y1) continue // Fix NaN
              // Background
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y1)
            ctx.lineTo(p2.x + 0.1, p2.y1)
            ctx.lineTo(p2.x + 0.1, p2.y3)
            ctx.lineTo(p1.x, p1.y3)
            ctx.fill()
              // Lines
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y1)
            ctx.lineTo(p2.x, p2.y1)
            if (this.show_mid) {
                ctx.moveTo(p1.x, p1.y2)
                ctx.lineTo(p2.x, p2.y2)
            }
            ctx.moveTo(p1.x, p1.y3)
            ctx.lineTo(p2.x, p2.y3)
            ctx.stroke()
          }
    },*/
    draw: function draw(ctx) {
      // Background
      var data = this.data;
      var layout = this.layout;
      ctx.beginPath();
      ctx.fillStyle = this.back_color;
      for (var i = 0; i < data.length; i++) {
        var p = data[i];
        var x = layout.t2screen(p[0]);
        var y = layout.$2screen(p[1] || undefined);
        ctx.lineTo(x, y);
      }
      for (var i = data.length - 1; i >= 0; i--) {
        var _p = data[i];
        var _x = layout.t2screen(_p[0]);
        var _y = layout.$2screen(_p[3] || undefined);
        ctx.lineTo(_x, _y);
      }
      ctx.fill();

      // Lines
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;

      // Top line
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p2 = data[i];
        var _x2 = layout.t2screen(_p2[0]);
        var _y2 = layout.$2screen(_p2[1] || undefined);
        ctx.lineTo(_x2, _y2);
      }
      ctx.stroke();
      // Bottom line
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p3 = data[i];
        var _x3 = layout.t2screen(_p3[0]);
        var _y3 = layout.$2screen(_p3[3] || undefined);
        ctx.lineTo(_x3, _y3);
      }
      ctx.stroke();
      // Middle line
      if (!this.show_mid) return;
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p4 = data[i];
        var _x4 = layout.t2screen(_p4[0]);
        var _y4 = layout.$2screen(_p4[2] || undefined);
        ctx.lineTo(_x4, _y4);
      }
      ctx.stroke();
    },
    mapp: function mapp(p) {
      var layout = this.$props.layout;
      return p && {
        x: layout.t2screen(p[0]),
        y1: layout.$2screen(p[1]),
        y2: layout.$2screen(p[2]),
        y3: layout.$2screen(p[3])
      };
    },
    use_for: function use_for() {
      return ['Channel', 'KC', 'BB'];
    },
    data_colors: function data_colors() {
      return [this.color, this.color, this.color];
    }
  }
});
;// ./src/components/overlays/Channel.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Channelvue_type_script_lang_js = (Channelvue_type_script_lang_js); 
;// ./src/components/overlays/Channel.vue
var Channel_render, Channel_staticRenderFns
;



/* normalize component */
;
var Channel_component = normalizeComponent(
  overlays_Channelvue_type_script_lang_js,
  Channel_render,
  Channel_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Channel = (Channel_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Segment.vue?vue&type=script&lang=js
// Segment renderer.


/* harmony default export */ const Segmentvue_type_script_lang_js = ({
  name: 'Segment',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.0'
      };
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      var layout = this.$props.layout;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      ctx.moveTo(x1, y1);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    use_for: function use_for() {
      return ['Segment'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  }
});
;// ./src/components/overlays/Segment.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Segmentvue_type_script_lang_js = (Segmentvue_type_script_lang_js); 
;// ./src/components/overlays/Segment.vue
var Segment_render, Segment_staticRenderFns
;



/* normalize component */
;
var Segment_component = normalizeComponent(
  overlays_Segmentvue_type_script_lang_js,
  Segment_render,
  Segment_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Segment = (Segment_component.exports);
;// ./src/components/js/layout_cnv.js


// Claculates postions and sizes for candlestick
// and volume bars for the given subset of data


function layout_cnv(self) {
  var $p = self.$props;
  var sub = $p.data;
  var t2screen = $p.layout.t2screen;
  var layout = $p.layout;
  var candles = [];
  var volume = [];

  // The volume bar height is determined as a percentage of
  // the chart's height (VOLSCALE)
  var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
    return x[5];
  })));
  var vs = $p.config.VOLSCALE * layout.height / maxv;
  var x1,
    x2,
    w,
    avg_w,
    mid,
    prev = undefined;

  // Subset interval against main interval
  var _new_interval = new_interval(layout, $p, sub),
    _new_interval2 = _slicedToArray(_new_interval, 2),
    interval2 = _new_interval2[0],
    ratio = _new_interval2[1];
  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0;

  // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift
  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1;

    // Clear volume bar if there is a time gap
    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }
    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5;

    // TODO: add log scale support
    candles.push({
      x: mid,
      w: layout.px_step * $p.config.CANDLEW * ratio,
      o: Math.floor(p[1] * layout.A + layout.B),
      h: Math.floor(p[2] * layout.A + layout.B),
      l: Math.floor(p[3] * layout.A + layout.B),
      c: Math.floor(p[4] * layout.A + layout.B),
      raw: p
    });
    volume.push({
      x1: x1,
      x2: x2,
      h: p[5] * vs,
      green: p[4] >= p[1],
      raw: p
    });
    prev = x2 + splitter;
  }
  return {
    candles: candles,
    volume: volume
  };
}
function layout_vol(self) {
  var $p = self.$props;
  var sub = $p.data;
  var t2screen = $p.layout.t2screen;
  var layout = $p.layout;
  var volume = [];

  // Detect data second dimention size:
  var dim = sub[0] ? sub[0].length : 0;

  // Support special volume data (see API book), or OHLCV
  // Data indices:
  self._i1 = dim < 6 ? 1 : 5;
  self._i2 = dim < 6 ? function (p) {
    return p[2];
  } : function (p) {
    return p[4] >= p[1];
  };
  var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
    return x[self._i1];
  })));
  var volscale = self.volscale || $p.config.VOLSCALE;
  var vs = volscale * layout.height / maxv;
  var x1,
    x2,
    mid,
    prev = undefined;

  // Subset interval against main interval
  var _new_interval3 = new_interval(layout, $p, sub),
    _new_interval4 = _slicedToArray(_new_interval3, 2),
    interval2 = _new_interval4[0],
    ratio = _new_interval4[1];
  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0;

  // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift
  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1;

    // Clear volume bar if there is a time gap
    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }
    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5;
    volume.push({
      x1: x1,
      x2: x2,
      h: p[self._i1] * vs,
      green: self._i2(p),
      raw: p
    });
    prev = x2 + splitter;
  }
  return volume;
}
function new_interval(layout, $p, sub) {
  // Subset interval against main interval
  if (!layout.ti_map.ib) {
    var interval2 = $p.tf || utils.detect_interval(sub);
    var ratio = interval2 / $p.interval;
  } else {
    if ($p.tf) {
      var ratio = $p.tf / layout.ti_map.tf;
      var interval2 = ratio;
    } else {
      var interval2 = utils.detect_interval(sub);
      var ratio = interval2 / $p.interval;
    }
  }
  return [interval2, ratio];
}
;// ./src/components/primitives/candle.js


// Candle object for Candles overlay
var CandleExt = /*#__PURE__*/function () {
  function CandleExt(overlay, ctx, data) {
    classCallCheck_classCallCheck(this, CandleExt);
    this.ctx = ctx;
    this.self = overlay;
    this.style = data.raw[6] || this.self;
    this.draw(data);
  }
  return createClass_createClass(CandleExt, [{
    key: "draw",
    value: function draw(data) {
      var green = data.raw[4] >= data.raw[1];
      var body_color = green ? this.style.colorCandleUp : this.style.colorCandleDw;
      var wick_color = green ? this.style.colorWickUp : this.style.colorWickDw;
      var w = Math.max(data.w, 1);
      var hw = Math.max(Math.floor(w * 0.5), 1);
      var h = Math.abs(data.o - data.c);
      var max_h = data.c === data.o ? 1 : 2;
      var x05 = Math.floor(data.x) - 0.5;
      this.ctx.strokeStyle = wick_color;
      this.ctx.beginPath();
      this.ctx.moveTo(x05, Math.floor(data.h));
      this.ctx.lineTo(x05, Math.floor(data.l));
      this.ctx.stroke();
      if (data.w > 1.5) {
        this.ctx.fillStyle = body_color;
        // TODO: Move common calculations to layout.js
        var s = green ? 1 : -1;
        this.ctx.fillRect(Math.floor(data.x - hw - 1), data.c, Math.floor(hw * 2 + 1), s * Math.max(h, max_h));
      } else {
        this.ctx.strokeStyle = body_color;
        this.ctx.beginPath();
        this.ctx.moveTo(x05, Math.floor(Math.min(data.o, data.c)));
        this.ctx.lineTo(x05, Math.floor(Math.max(data.o, data.c)) + (data.o === data.c ? 1 : 0));
        this.ctx.stroke();
      }
    }
  }]);
}();

;// ./src/components/primitives/volbar.js


var VolbarExt = /*#__PURE__*/function () {
  function VolbarExt(overlay, ctx, data) {
    classCallCheck_classCallCheck(this, VolbarExt);
    this.ctx = ctx;
    this.$p = overlay.$props;
    this.self = overlay;
    this.style = data.raw[6] || this.self;
    this.draw(data);
  }
  return createClass_createClass(VolbarExt, [{
    key: "draw",
    value: function draw(data) {
      var y0 = this.$p.layout.height;
      var w = data.x2 - data.x1;
      var h = Math.floor(data.h);
      this.ctx.fillStyle = data.green ? this.style.colorVolUp : this.style.colorVolDw;
      this.ctx.fillRect(Math.floor(data.x1), Math.floor(y0 - h - 0.5), Math.floor(w), Math.floor(h + 1));
    }
  }]);
}();

;// ./src/components/primitives/price.js


// Price bar & price line (shader)
var Price = /*#__PURE__*/function () {
  function Price(comp) {
    classCallCheck_classCallCheck(this, Price);
    this.comp = comp;
  }

  // Defines an inline shader (has access to both
  // target & overlay's contexts)
  return createClass_createClass(Price, [{
    key: "init_shader",
    value: function init_shader() {
      var _this = this;
      var layout = this.comp.$props.layout;
      var config = this.comp.$props.config;
      var comp = this.comp;
      var last_bar = function last_bar() {
        return _this.last_bar();
      };
      //console.log("init_shader comp",comp?.isArrow)
      this.comp.$emit('new-shader', {
        target: 'sidebar',
        draw: function draw(ctx) {
          var bar = last_bar();
          if (!bar) return;
          var w = ctx.canvas.width;
          var h = config.PANHEIGHT;
          //let lbl = bar.price.toFixed(layout.prec)
          var lbl = bar.price.toFixed(comp.decimalPlace);
          ctx.fillStyle = bar.color;
          var x = -0.5;
          var a = 7;
          // let isArrow = comp.$props.settings

          if (comp !== null && comp !== void 0 && comp.isArrow) {
            //y according to arrow
            var y = bar.y - h * 0 - 0.5;

            //map client arrow work
            ctx.miterLimit = 4;
            ctx.font = "15px''";
            ctx.fillStyle = bar.color;
            ctx.font = "15px''";
            ctx.save();
            ctx.fillStyle = bar.color;
            ctx.font = "15px''";
            ctx.beginPath();
            //1. ctx.moveTo(0,16);
            ctx.moveTo(x - 0.5, y);
            //2. ctx.lineTo(19,0);
            ctx.lineTo(x - 0.5 + 19, y - 16);
            //3. ctx.lineTo(66.5,0);
            ctx.lineTo(x - 0.5 + 19 + 66.5, y - 16);
            //4. ctx.lineTo(66.5,35);
            ctx.lineTo(x - 0.5 + 19 + 66.5, y + 32 - 16);
            //5. ctx.lineTo(19,35);
            ctx.lineTo(x - 0.5 + 19, y + 32 - 16);
            //6. ctx.lineTo(0,16);
            ctx.lineTo(x - 0.5, y);
            ctx.closePath();
            ctx.fill();
            // ctx.stroke();
            ctx.restore();
            ctx.restore();
            ctx.fillStyle = comp.$props.colors.textHL;
            ctx.textAlign = 'left';

            //for arrow work
            ctx.fillText(lbl, a + 10, y + 5);
          } else {
            var _x = -0.5;
            var _y = bar.y - h * 0.5 - 0.5;
            var _a = 7;
            ctx.fillRect(_x - 0.5, _y, w + 1, h);
            ctx.fillStyle = comp.$props.colors.textHL;
            ctx.textAlign = 'left';
            ctx.fillText(lbl, _a, _y + 15);
          }
        }
      });
      this.shader = true;
    }

    // Regular draw call for overaly
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (!this.comp.$props.meta.last) return;
      if (!this.shader) this.init_shader();
      var layout = this.comp.$props.layout;
      var last = this.comp.$props.last;
      var dir = last[4] >= last[1];
      var color = dir ? this.green() : this.red();
      var y = layout.$2screen(last[4]) + (dir ? 1 : 0);
      ctx.strokeStyle = color;
      ctx.setLineDash([1, 1]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(layout.width, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, {
    key: "last_bar",
    value: function last_bar() {
      if (!this.comp.data.length) return undefined;
      var layout = this.comp.$props.layout;
      var last = this.comp.data[this.comp.data.length - 1];
      var y = layout.$2screen(last[4]);
      //let cndl = layout.c_magnet(last[0])
      return {
        y: y,
        //Math.floor(cndl.c) - 0.5,
        price: last[4],
        color: last[4] >= last[1] ? this.green() : this.red()
      };
    }
  }, {
    key: "last_price",
    value: function last_price() {
      return this.comp.$props.meta.last ? this.comp.$props.meta.last[4] : undefined;
    }
  }, {
    key: "green",
    value: function green() {
      return this.comp.colorCandleUp;
    }
  }, {
    key: "red",
    value: function red() {
      return this.comp.colorCandleDw;
    }
  }, {
    key: "drawArrow",
    value: function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
      //variables to be used when creating the arrow
      ctx.strokeStyle = "rgba(0,0,0,0)";
      ctx.miterLimit = 4;
      ctx.font = "15px ''";
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.font = "   15px ''";
      ctx.save();
      ctx.fillStyle = "#E65C5C";
      ctx.font = "   15px ''";
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(19, 0);
      ctx.lineTo(66.5, 0);
      ctx.lineTo(66.5, 35);
      ctx.lineTo(19, 35);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      return;
      var headlen = 15;
      var angle = Math.atan2(toy - fromy, tox - fromx);
      ctx.save();
      ctx.strokeStyle = color;

      //starting path of the arrow from the start square to the end square
      //and drawing the stroke
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.lineWidth = arrowWidth;
      ctx.stroke();

      //starting a new path from the head of the arrow to one of the sides of
      //the point
      ctx.beginPath();
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 4), toy - headlen * Math.sin(angle - Math.PI / 4));

      //path from the side point of the arrow, to the other side point
      ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 4), toy - headlen * Math.sin(angle + Math.PI / 4));

      //path from the side point back to the tip of the arrow, and then
      //again to the opposite side point
      ctx.lineTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 4), toy - headlen * Math.sin(angle - Math.PI / 4));

      //draws the paths created above
      ctx.stroke();
      ctx.restore();
    }
  }]);
}();

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Candles.vue?vue&type=script&lang=js
// Renedrer for candlesticks + volume (optional)
// It can be used as the main chart or an indicator






/* harmony default export */ const Candlesvue_type_script_lang_js = ({
  name: "Candles",
  mixins: [overlay],
  data: function data() {
    return {
      price: {}
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    show_volume: function show_volume() {
      return "showVolume" in this.sett ? this.sett.showVolume : true;
    },
    price_line: function price_line() {
      return "priceLine" in this.sett ? this.sett.priceLine : true;
    },
    colorCandleUp: function colorCandleUp() {
      return this.sett.colorCandleUp || this.$props.colors.candleUp;
    },
    colorCandleDw: function colorCandleDw() {
      return this.sett.colorCandleDw || this.$props.colors.candleDw;
    },
    colorWickUp: function colorWickUp() {
      return this.sett.colorWickUp || this.$props.colors.wickUp;
    },
    colorWickDw: function colorWickDw() {
      return this.sett.colorWickDw || this.$props.colors.wickDw;
    },
    colorWickSm: function colorWickSm() {
      return this.sett.colorWickSm || this.$props.colors.wickSm;
    },
    colorVolUp: function colorVolUp() {
      return this.sett.colorVolUp || this.$props.colors.volUp;
    },
    colorVolDw: function colorVolDw() {
      return this.sett.colorVolDw || this.$props.colors.volDw;
    },
    isArrow: function isArrow() {
      return "isArrow" in this.sett ? this.sett.isArrow : false;
    },
    decimalPlace: function decimalPlace() {
      // return this.sett?.decimalPlace || 2;
      return "decimalPlace" in this.sett ? this.sett.decimalPlace : 2;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: "C451",
        version: "1.2.1"
      };
    },
    init: function init() {
      this.price = new Price(this);
    },
    draw: function draw(ctx) {
      // If data === main candlestick data
      // render as main chart:
      if (this.$props.sub === this.$props.data) {
        var cnv = {
          candles: this.$props.layout.candles,
          volume: this.$props.layout.volume
        };
        // Else, as offchart / onchart indicator:
      } else {
        cnv = layout_cnv(this);
      }
      if (this.show_volume) {
        var cv = cnv.volume;
        for (var i = 0, n = cv.length; i < n; i++) {
          new VolbarExt(this, ctx, cv[i]);
        }
      }
      var cc = cnv.candles;
      for (var i = 0, n = cc.length; i < n; i++) {
        new CandleExt(this, ctx, cc[i]);
      }
      if (this.price_line) this.price.draw(ctx);
    },
    use_for: function use_for() {
      return ["Candles"];
    },
    // In case it's added as offchart overlay
    y_range: function y_range() {
      var hi = -Infinity,
        lo = Infinity;
      for (var i = 0, n = this.sub.length; i < n; i++) {
        var x = this.sub[i];
        if (x[2] > hi) hi = x[2];
        if (x[3] < lo) lo = x[3];
      }
      var yRange = [hi, lo];
      // console.log("yRange",yRange)
      return yRange;
    }
  },
  watch: {
    isArrow: {
      handler: function handler(value) {
        //console.log("candles isArrows",value,this.price)
        this.price = new Price(this);
      }
    }
  },
  mounted: function mounted() {
    //console.log("candles mounted", this.$props);
  }
});
;// ./src/components/overlays/Candles.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Candlesvue_type_script_lang_js = (Candlesvue_type_script_lang_js); 
;// ./src/components/overlays/Candles.vue
var Candles_render, Candles_staticRenderFns
;



/* normalize component */
;
var Candles_component = normalizeComponent(
  overlays_Candlesvue_type_script_lang_js,
  Candles_render,
  Candles_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Candles = (Candles_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Volume.vue?vue&type=script&lang=js

function Volumevue_type_script_lang_js_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = Volumevue_type_script_lang_js_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function Volumevue_type_script_lang_js_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return Volumevue_type_script_lang_js_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? Volumevue_type_script_lang_js_arrayLikeToArray(r, a) : void 0; } }
function Volumevue_type_script_lang_js_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Standalone renedrer for the volume




/* harmony default export */ const Volumevue_type_script_lang_js = ({
  name: 'Volume',
  mixins: [overlay],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    colorVolUp: function colorVolUp() {
      return this.sett.colorVolUp || this.$props.colors.volUp;
    },
    colorVolDw: function colorVolDw() {
      return this.sett.colorVolDw || this.$props.colors.volDw;
    },
    colorVolUpLegend: function colorVolUpLegend() {
      return this.sett.colorVolUpLegend || this.$props.colors.candleUp;
    },
    colorVolDwLegend: function colorVolDwLegend() {
      return this.sett.colorVolDwLegend || this.$props.colors.candleDw;
    },
    volscale: function volscale() {
      return this.sett.volscale || this.$props.grid_id > 0 ? 0.85 : this.$props.config.VOLSCALE;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    draw: function draw(ctx) {
      // TODO: volume average
      // TODO: Y-axis scaling
      var _iterator = Volumevue_type_script_lang_js_createForOfIteratorHelper(layout_vol(this)),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var v = _step.value;
          new VolbarExt(this, ctx, v);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    use_for: function use_for() {
      return ['Volume'];
    },
    // Defines legend format (values & colors)
    // _i2 - detetected data index (see layout_cnv)
    legend: function legend(values) {
      var flag = this._i2 ? this._i2(values) : values[2];
      var color = flag ? this.colorVolUpLegend : this.colorVolDwLegend;
      return [{
        value: values[this._i1 || 1],
        color: color
      }];
    },
    // When added as offchart overlay
    // If data is OHLCV => recalc y-range
    // _i1 - detetected data index (see layout_cnv)
    y_range: function y_range(hi, lo) {
      var _this = this;
      if (this._i1 === 5) {
        var sub = this.$props.sub;
        return [Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
          return x[_this._i1];
        }))), Math.min.apply(Math, _toConsumableArray(sub.map(function (x) {
          return x[_this._i1];
        })))];
      } else {
        return [hi, lo];
      }
    }
  }
});
;// ./src/components/overlays/Volume.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Volumevue_type_script_lang_js = (Volumevue_type_script_lang_js); 
;// ./src/components/overlays/Volume.vue
var Volume_render, Volume_staticRenderFns
;



/* normalize component */
;
var Volume_component = normalizeComponent(
  overlays_Volumevue_type_script_lang_js,
  Volume_render,
  Volume_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Volume = (Volume_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Splitters.vue?vue&type=script&lang=js
// Data section splitters (with labels)


/* harmony default export */ const Splittersvue_type_script_lang_js = ({
  name: 'Splitters',
  mixins: [overlay],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    new_font: function new_font() {
      return this.sett.font || '12px ' + this.$props.font.split('px').pop();
    },
    flag_color: function flag_color() {
      return this.sett.flagColor || '#4285f4';
    },
    label_color: function label_color() {
      return this.sett.labelColor || '#fff';
    },
    line_color: function line_color() {
      return this.sett.lineColor || '#4285f4';
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 1.0;
    },
    y_position: function y_position() {
      return this.sett.yPosition || 0.9;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    draw: function draw(ctx) {
      var _this = this;
      var layout = this.$props.layout;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.line_color;
      this.$props.data.forEach(function (p, i) {
        ctx.beginPath();
        var x = layout.t2screen(p[0]); // x - Mapping
        ctx.setLineDash([10, 10]);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, _this.layout.height);
        ctx.stroke();
        if (p[1]) _this.draw_label(ctx, x, p);
      });
    },
    draw_label: function draw_label(ctx, x, p) {
      var side = p[2] ? 1 : -1;
      x += 2.5 * side;
      ctx.font = this.new_font;
      var pos = p[4] || this.y_position;
      var w = ctx.measureText(p[1]).width + 10;
      var y = this.layout.height * (1.0 - pos);
      y = Math.floor(y);
      ctx.fillStyle = p[3] || this.flag_color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y + 10 * side);
      ctx.lineTo(x + 10 * side, y + 10 * side);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = this.label_color;
      ctx.textAlign = side < 0 ? 'right' : 'left';
      ctx.fillText(p[1], x + 15 * side, y + 4);
    },
    use_for: function use_for() {
      return ['Splitters'];
    }
  }
});
;// ./src/components/overlays/Splitters.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_Splittersvue_type_script_lang_js = (Splittersvue_type_script_lang_js); 
;// ./src/components/overlays/Splitters.vue
var Splitters_render, Splitters_staticRenderFns
;



/* normalize component */
;
var Splitters_component = normalizeComponent(
  overlays_Splittersvue_type_script_lang_js,
  Splitters_render,
  Splitters_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Splitters = (Splitters_component.exports);
;// ./src/stuff/keys.js


function keys_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = keys_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function keys_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return keys_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? keys_arrayLikeToArray(r, a) : void 0; } }
function keys_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Keyboard event handler for overlay
var Keys = /*#__PURE__*/function () {
  function Keys(comp) {
    classCallCheck_classCallCheck(this, Keys);
    this.comp = comp;
    this.map = {};
    this.listeners = 0;
    this.keymap = {};
  }
  return createClass_createClass(Keys, [{
    key: "on",
    value: function on(name, handler) {
      if (!handler) return;
      this.map[name] = this.map[name] || [];
      this.map[name].push(handler);
      this.listeners++;
    }

    // Called by grid.js
  }, {
    key: "emit",
    value: function emit(name, event) {
      if (name in this.map) {
        var _iterator = keys_createForOfIteratorHelper(this.map[name]),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var f = _step.value;
            f(event);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      if (name === 'keydown') {
        if (!this.keymap[event.key]) {
          this.emit(event.key);
        }
        this.keymap[event.key] = true;
      }
      if (name === 'keyup') {
        this.keymap[event.key] = false;
      }
    }
  }, {
    key: "pressed",
    value: function pressed(key) {
      return this.keymap[key];
    }
  }]);
}();

;// ./src/mixins/tool.js
function tool_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = tool_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function tool_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return tool_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? tool_arrayLikeToArray(r, a) : void 0; } }
function tool_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Usuful stuff for creating tools. Include as mixin



/* harmony default export */ const tool = ({
  methods: {
    init_tool: function init_tool() {
      var _this = this;
      // Collision functions (float, float) => bool,
      this.collisions = [];
      this.pins = [];
      this.mouse.on('mousemove', function (e) {
        if (_this.collisions.some(function (f) {
          return f(_this.mouse.x, _this.mouse.y);
        })) {
          _this.show_pins = true;
        } else {
          _this.show_pins = false;
        }
        if (_this.drag) _this.drag_update();
      });
      this.mouse.on('mousedown', function (e) {
        if (utils.default_prevented(e)) return;
        if (_this.collisions.some(function (f) {
          return f(_this.mouse.x, _this.mouse.y);
        })) {
          if (!_this.selected) {
            _this.$emit('object-selected');
          }
          _this.start_drag();
          e.preventDefault();
          _this.pins.forEach(function (x) {
            return x.mousedown(e, true);
          });
        }
      });
      this.mouse.on('mouseup', function (e) {
        _this.drag = null;
        _this.$emit('scroll-lock', false);
      });
      this.keys = new Keys(this);
      this.keys.on('Delete', this.remove_tool);
      this.keys.on('Backspace', this.remove_tool);
      this.show_pins = false;
      this.drag = null;
    },
    render_pins: function render_pins(ctx) {
      if (this.selected || this.show_pins) {
        this.pins.forEach(function (x) {
          return x.draw(ctx);
        });
      }
    },
    set_state: function set_state(name) {
      this.$emit('change-settings', {
        $state: name
      });
    },
    watch_uuid: function watch_uuid(n, p) {
      // If layer $uuid is changed, then re-init
      // pins & collisions
      if (n.$uuid !== p.$uuid) {
        var _iterator = tool_createForOfIteratorHelper(this.pins),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var p = _step.value;
            p.re_init();
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.collisions = [];
        this.show_pins = false;
        this.drag = null;
      }
    },
    pre_draw: function pre_draw() {
      // Delete all collision functions before
      // the draw() call and let primitives set
      // them again
      this.collisions = [];
    },
    remove_tool: function remove_tool() {
      if (this.selected) {
        console.log("remove_tool");
        this.$emit('remove-tool');
      }
    },
    start_drag: function start_drag() {
      this.$emit('scroll-lock', true);
      var cursor = this.$props.cursor;
      this.drag = {
        t: cursor.t,
        y$: cursor.y$
      };
      this.pins.forEach(function (x) {
        return x.rec_position();
      });
    },
    drag_update: function drag_update() {
      var dt = this.$props.cursor.t - this.drag.t;
      var dy = this.$props.cursor.y$ - this.drag.y$;
      this.pins.forEach(function (x) {
        return x.update_from([x.t1 + dt, x.y$1 + dy], true);
      });
    }
  },
  computed: {
    // Settings starting with $ are reserved
    selected: function selected() {
      return this.$props.settings.$selected;
    },
    state: function state() {
      return this.$props.settings.$state;
    }
  }
});
;// ./src/stuff/icons.json
const icons_namespaceObject = /*#__PURE__*/JSON.parse('{"extended.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAANElEQVR4nGNggABGEMEEIlhABAeI+AASF0AlHmAqA4kzKAAx8wGQuAMKwd6AoYzBAWonAwAcLwTgNfJ3RQAAAABJRU5ErkJggg==","ray.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAMklEQVR4nGNgQAJMIIIFRHCACAEQoQAiHICYvQEkjkrwYypjAIkzwk2zAREuqIQFzD4AE3kE4BEmGggAAAAASUVORK5CYII=","segment.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAATU1NJCQkCxcHIQAAAAN0Uk5TAP8SmutI5AAAACxJREFUeJxjYMACGAMgNAsLdpoVKi8AVe8A1QblQlWRKt0AoULw2w1zGxoAABdiAviQhF/mAAAAAElFTkSuQmCC","add.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAH5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKBgYGGxsbKioqPz8/Pj4+BQUFCQkJAQEBZGRkh4eHAgICEBAQNjY2g4ODgYGBAAAAAwMDeXl5d3d3GBgYERERgICAgICANDQ0PDw8Y2NjCAgIhYWFGhoaJycnOjo6YWFhgICAdXV14Y16sQAAACp0Uk5TAAILDxIKESEnJiYoKCgTKSkpKCAnKSkFKCkpJiDl/ycpKSA2JyYpKSkpOkQ+xgAAARdJREFUeJzllNt2gyAQRTWiRsHLoDU0GpPYmMv//2BMS+sgl6Z9bM8bi73gnJkBz/sn8lcBIUHofwtG8TpJKUuTLI6cYF7QEqRKynP71VX9AkhNXVlsbMQrLLQVGyPZLsGHWgPrCxMJwHUPlXa79NBp2et5d9f3u3m1XxatQNn7SagOXCUjCjYUDuqxcWlHj4MSfw12FDJchFViRN8+1qcQoUH6lR1L1mEMEErofB6WzEUwylzomfzOQGiOJdXiWH7mQoUyMa4WXJQWOBvLFvPCGxt6FSr5kyH0qi0YddNG2/pgCsOjff4ZTizXPNwKIzl56OoGg9d9Z/+5cs6On+CFCfevFQ3ZaTycx1YMbvDdRvjkp/lHdAcPXzokxcwfDwAAAABJRU5ErkJggg==","cursor.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAxQTFRFAAAATU1NTU1NTU1NwlMHHwAAAAR0Uk5TAOvhxbpPrUkAAAAkSURBVHicY2BgYHBggAByabxg1WoGBq2pRCk9AKUbcND43AEAufYHlSuusE4AAAAASUVORK5CYII=","display_off.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAU1QTFRFAAAAh4eHh4eHAAAAAAAAAAAAAwMDAAAAAAAAhoaGGBgYgYGBAAAAPz8/AgICg4ODCQkJhISEh4eHh4eHPj4+NjY2gYGBg4ODgYGBgYGBgoKCAQEBJycngoKChYWFEBAQg4ODCAgIKioqZGRkCgoKBQUFERERd3d3gYGBGxsbNDQ0hISEgYGBPDw8gYGBgYGBh4eHh4eHhYWFh4eHgoKChYWFgYGBgYGBg4ODhoaGg4ODYWFhgoKCBgYGdXV1goKCg4ODgYGBgICAgYGBAAAAg4ODhYWFhISEh4eHgoKChYWFOjo6goKCGhoah4eHh4eHh4eHgoKCh4eHeXl5hoaGgoKChISEgYGBgYGBgoKCY2NjgYGBgoKCh4eHgoKCgYGBhoaGg4ODhoaGhYWFh4eHgYGBhoaGhoaGhoaGg4ODgoKChISEgoKChYWFh4eHfKktUwAAAG90Uk5TACn/AhEFKA8SLCbxCigoVBNKUTYoJ/lh3PyAKSaTNiBtICYpISggKSkmJ0LEKef3lGxA8rn//+pcMSkpnCcptHPJKe0LUjnx5LzKKaMnX73hl64pLnhkzNSgKeLv17LQ+liIzaLe7PfTw5tFpz3K1fXR/gAAAgBJREFUeJzllNdXwjAUxknB0lIoCKVsGTIFQRAZ7r333nuv///R3LZ4mlDQZ/0ekp7b37n5bnITk+mfyDxv5Tir3fwjaElO5BIOKZFLJS1dQVfI0Y809TtEV+elo95RpFPWG+1go4fdQ5QybI8haaNBkM2ANbM09bnrwaPY7iFKrz7EMBdu7CHdVruXIt0M1hb+GKA3LTRKkp5lTA6Dg6xIkhaHhvQ1IlW/UCouQdJNJTRIpk1qO7+wUpcfpl537oBc7VNip3Gi/AmVPBAC1UrL6HXtSGVT+k2Yz0Focad07OMRf3P5BEbd63PFQx7HN+w61JoAm+uBlV48O/0jkLSMmtPCmQ8HwlYdykFV4/LJPp7e3hVyFdapHNehLk6PSjhSkBvwu/cFyJGIYvOyhoc1jjYQFGbygD4CWjoAMla/og3YoSw+KPhjPNoFcim4iFD+pFYA8zZ9WeYU5OBjZ3ORWyCfG03E+47kKpCIJTpGO4KP8XMgtw990xG/PBNTgmPEEXwf7P42oOdFIRAoBCtqTKL6Rcwq4Xsgh5xYC/mmSs6yJKk1YbnVeTq1NaEpmlHbmVn2EORkW2trF2ZzmHGTSUMGl1a9hp4ySRpdQ8yKGURpMmRIYg9pb1YPzg6kO79cLlE6bYFjEtv91bLEUxvhwbWwjY13BxUb9l8+mn9EX8x3Nki8ff5wAAAAAElFTkSuQmCC","display_on.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAR1QTFRFAAAAh4eHgYGBAAAAAAAAgYGBAAAAAwMDAAAAAAAAgYGBg4ODGBgYgYGBhISEAAAAPz8/AgIChoaGCQkJhYWFPj4+NjY2goKCgYGBAQEBJycngYGBgoKCEBAQCAgIhISEKioqZGRkCgoKBQUFERERd3d3gYGBg4ODgYGBGxsbNDQ0hISEgoKCgoKChYWFPDw8gYGBgYGBhoaGgoKCg4ODgoKCgYGBgoKCgoKCgoKCg4ODgoKChoaGgoKCgYGBhoaGg4ODYWFhBgYGdXV1gYGBg4ODgoKCgICAg4ODg4ODhISEAAAAg4ODOjo6gYGBGhoaeXl5goKCgYGBgoKChYWFgoKChISEgoKCY2NjgYGBg4ODgYGBgYGBg4ODgYGBo8n54AAAAF90Uk5TACn/AhH3BSgPEuhUJvFACigoLBM2KCeA6ykm+pMgIEkmKSEoICn9XCkmJ0u6nDop4sUypGuEzLZ6vmCYLZ/dLykpJynUYa8pcllCC1Ip2ycpisl1PadFsintbsPQZdi/bTW7AAAB4UlEQVR4nOWUZ1fCMBSGSSGWFiq0UDbIkr2XbBwMxS0b1P//M0xK9XSiftX7oel585zkvfcmMRj+SRhvzRRlthm/BU3Ry3TYzofTsajpIOjw2iNAjIiddehvHXSdA0mkXEEdG0fkE1DEKXmkSVqVIA6rBmsktUgAWLWHoGp30UNclbtLmwQgoyya91wPTbFy0mQXJ5zJQO6BgXRjfH0iSkX5stHIXr5r0bB/lu8syjR8rzsFbR2SpX+5J2eMP3csLtYsEY2K8BeTFuE2jaVCBw7bHOBuxq16AXmpbui3LtIfbRLUHMY2q4lcFo2WB4KA1SUAlWumNEKCzyxBKZxVHvYGaFguCBx1vM/x0IPzoqQoj5SdP4mns2cCGhBsrgj0uaeUBtzMyxQN8w4mYROTW8+r0oANp8W5mf6WQw5aCYJ2o7ymPaKMi2uVpmWM4TW6tdImgGo1bT4nK6DbbsCc0AZSdmLEFszzHrh6riVvRrNA3/9SE8QLWQu+Gjto9+gE9NBMwr9zi83gFeeFTe11zpm1CHE3HeyVCSknf3MIDcFTbfJKdbR1L4xX49L+/BoillV5uPJqkshD3JWSgpNMXP/lcrD8+hO84MnDr5YpFHv0Fe99VjJ0GBRs2H74aP6R+ACr+TFvZNAQ1wAAAABJRU5ErkJggg==","down.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAKVQTFRFAAAAg4ODgICAAAAAAAAAAAAACAgIAAAAAAAAAAAAAAAAOTk5hYWFEBAQfHx8ODg4dnZ2NDQ0XV1dGxsbKCgogICAFBQUIiIiZGRkgICAgICAFRUVAAAAgICAgICAgICAf39/Li4ugICAcHBwgoKCgICAgoKCgICAg4ODgYGBPj4+goKCgICAhISEgYGBgICAgoKCgICAgYGBgYGBf39/gICAgICAIdPQHAAAADd0Uk5TACn/KAIRIBMFDwooKyApKSknKSYmzCcmKfL7JRCUi2L3J7IpcLUrr0VbKXntNEnkMbxrUcG56CMpi50AAAFZSURBVHic5ZRpf4MgDIeFKFatWm/tfW091u7evv9Hm1Acoujm2y0vFPH5Jf+EEE37J6bblmlatv4jaBCI4rMfR0CMXtAEJ0fccgfM7tAkQHXzArdDxggmqGETGCnJWROkNlOwOqhIhKCtgbSicw1uK/dATSK0aRatIzytA8ik4XSiyJnLSm+VPxULgeyLI3uHRJH+qcB4WZGrKb4c20WwI7b3iUt74OS6XD+xZWrXUCtme0uKTvfcJ65CZFa9VOebqwXmft+oT8yF+/VymT4XeGB+Xx8L+j4gBcoFIDT+oMz6Qp93Y74pCeBpUXaLuW0rUk6r1iv3nP322ewYkgv2nZIvgpSPQDrY5wTjRJDNg9XAE/+uSXIVX812GdKEmtvR2rtWaw+5MAOuofJy79SXu9TgBl4d9DZdI0NjgyiswNCB/qk1J5Bmvp+lQOa9IJNhW4bxm6H5R+wLQYMSQXZNzbcAAAAASUVORK5CYII=","price_range.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAIUlEQVR4nGNggAPm/w9gTA4QIQMitECEJ1yMEgLNDiAAADfgBMRu78GgAAAAAElFTkSuQmCC","price_time.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAOklEQVR4nGNggAPm/w9gTA4QIQPEClpMQMITRHCACScQoQQihBgY9P//grKgYk5wdTACYhQHFjuAAABZFAlc4e1fcQAAAABJRU5ErkJggg==","remove.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAK5QTFRFAAAAh4eHgICAAAAAAAAAh4eHAAAAAwMDAAAAAAAAgICAGBgYAAAAPz8/AgICgICACQkJhoaGhoaGgICAPj4+NjY2gYGBg4ODgYGBAQEBJycngoKCEBAQgICAgICACAgIKioqZGRkCgoKBQUFERERd3d3gYGBGxsbNDQ0gICAPDw8YWFhBgYGdXV1gICAg4ODgICAAAAAOjo6GhoaeXl5gICAhYWFY2NjhYWFgICA9O0oCgAAADp0Uk5TACn/AhErBSgPEvEmCigowxMuMcgoJ7hWrCkmdCD6vSAmKSEoICkpJie6KSknKSkp0wspJynCMik11rrLte8AAAFwSURBVHic5ZTXkoIwFIZNAAPSpKkoRQV7Wcva3v/FFiRmEwise7t7bs7MP98k/ylJq/VPQjjKiiJrwo+gON0uxro7XiRTsRHs+voE4JjoRrf+6sD7AFTMvaDGRht9glLMUJtLqmUwD5XDCohHAmBUPQSV27GHtFK7xycBWJab5uPaR+Hlmue7GfZxHwyWFHVMQghXFgD2A8IOZtfssdNJIXcyFEaSfchzp9BuMVP+Fhvr5Qh0nGfqYTGhm3BcYFUaQBKOhMWzRqHyGFRY03ppQ5lCFZ30RloVZGQTaa3QqEt0OyrQnkSkk8I1YJkvAwPCMgY0UpbzXRZhVbosIWGbZTLNQszGMCM42FJEjWDDjIAMtp+xj6x2K+/DqNDc0r4Yc8yGl3uer2aIyT1iyd8sYSuY8cldZbVrH4zPebTvP8OMNSoedj6XzDyk3pwG98u0/ufqGu7tBW5c1PxriXFyHq5PQxXFzeDThvbmp/lH4gt6WxfZ03H8DwAAAABJRU5ErkJggg==","settings.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAW5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKBgYGGxsbKioqQEBAPj4+BQUFCAgIAQEBPz8/ZWVlh4eHZGRkAgICCQkJDw8PNjY2g4ODgoKCNTU1EBAQAAAAAwMDeXl5d3d3AAAAGBgYAAAAERERioqKgoKCgoKCgoKCgYGBgoKChISEhoaGNDQ0g4ODgICAgICAgICAgYGBgYGBhYWFgICAgICAPT09AAAAgYGBgICAgICAgICAgICAY2NjCAgIgICAgICAhYWFhYWFgYGBHBwcgICAhYWFGhoagYGBgYGBg4ODhoaGJycnAAAAhISEgICAg4ODPDw8AAAAgoKCgICAhISEOjo6h4eHgoKCgYGBgICAf39/gYGBgoKCgICAGBgYgYGBg4ODg4ODgICACwsLgYGBgICAgYGBgYGBgYGBgICAgYGBYWFhf39/g4ODPj4+gYGBg4ODgICAhYWFgoKCgYGBgICAgYGBgoKCdXV1T0kC9QAAAHp0Uk5TAAILDxMKESEnJiYpKSgTKSgpKSkoEyAnKSknIAYoKSkFJQEgKl94jYVvVC4nU9f/+K8pOu71KBCi3NPq/ikg0e01Nokm1UUnsZVqQSYOT9lrKRJz5lIpK12jyu+sesgnhGVLxCG55a6Um+GaKfJCKKRgKUt8ocergymDQ9knAAABsElEQVR4nOWUV1vCMBSGg1AQpBZrcVdE3KJxo4LgnuCoe4F7orjHv7doTk3bgF7rd5OnX94nZ+SkCP0TWQqsNpuVs/wI2h2FTleR2+XkHfa8YLHgKRGJSj2SN3fosvIKkVJlVXWONGrkWtEgn1zHJP1GMCs/g7XILFIUpXoTWmaKTnIImGovh72Gxqbmlta2dvgOGpsmQO0dnfhTXd3E6JH0pN1DNnr7MFE/HDsQ0qEO6Pxg9sCh4XDkGx2J6sovBD+G8eiYuo5PxLTKeLoJBZNgT2EcnjY0YYajUKsL7Fk1gcjU3PwChcYTFGorAnsRqlpa1tAVhUbdmr+6RtjIOlgbCjMBUdzc2t7ZzbJ7zAQ4p6GSfRVNwkeKLsvCg31w2JBdjlT0GDxZNzEnpcQ+xWfnFxeXVyp6Tay07gq+L/YUOoBvbomV0V8skiq//DutWfeEfJD1JPLCED4+Pb8kX986tApNQ4iqfSJT76bRzvlgBPODQXW/foYqK5lyeBeYJEL1gaoeGnwIBhjRoQ9SZgTAdEbO/9cKRfmZ+MpGPCVHQ3nBzzS4hKIkuNyh/5g+ALiAXSSas9hwAAAAAElFTkSuQmCC","time_range.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAJElEQVR4nGNgwAsUGJhQCScQoQQihBgY9P//grKgYk4YOvACACOpBKG6Svj+AAAAAElFTkSuQmCC","trash.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAALUlEQVR4nGNgAIN6ENHQACX4//9gYBBgYIESYC4LkA0lPEkmGFAI5v8PILYCAHygDJxlK0RUAAAAAElFTkSuQmCC","up.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAMZQTFRFAAAAh4eHgICAAAAAAAAAAAAAAwMDAAAAAAAAGBgYAAAAPz8/AgICCQkJgICAh4eHPj4+NjY2AQEBJycnEBAQgICAgICACAgIKioqZGRkCgoKBQUFgYGBERERd3d3gYGBGxsbNDQ0gICAgYGBPDw8gYGBh4eHgICAYWFhBgYGgYGBdXV1goKCg4ODhYWFgICAgoKCAAAAhISEOjo6gICAGhoagYGBeXl5hoaGgICAY2Njg4ODgoKCgoKCgYGBgoKCg4ODgoKC64uw1gAAAEJ0Uk5TACn/AhEFKA8SJgooKBP7KignKSYg9c0gJikhKLQgKSkmJ7ywKY8s5SknlClxKTMpXwtFKe0neiku8ClKWmSbbFFjM5GHSgAAAW5JREFUeJzllGd/gjAQxk3AMFWWOHDvVa2rVbu//5cqhJWQQO3b9nkVjv/v7rnLKJX+iYS9JMuSKvwIiu3loKkZzYHXFgvBiqW1QKSWplfySzvmAyDUN50cG2X0DDLqoTKXVLJgIIXDCohHAqCzHhymeuShy/Ru8kkAhtmhWUTvW9fdEnPQaVLU0n8XF0L3kn5P6LTtZPKgNoK+RrUkcGtQ7S9TsgOxxinrkUPYD+LwLCIh7CTsWSVQqRmTuPqpitlZFLQlApXjrsYBc335wOw47ksmUSMMrgKi/gnAE/awCqNHmTUwDf5X34LlBuedsgbUsK15kPMxTIXzzvFSIdsSPBw7nGD1K+7bL3F9xStEnZhoCw71TbpL71GBBbUF1MZmZWTOi97PI3eIJn9zCEtOj0+umaOde2EszqW9/xr6rM54WFtc0vfQNak57Ibd/Jerohu3GFwYqPjVEhve2Z4cbQU1ikFsQ73z0fwj+ga3VBezGuggFQAAAABJRU5ErkJggg==","gear.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfnAQcPAREf1cYdAAABVklEQVRIx82VTU7DMBCFP6iaIjVIvQKI8neKNjStBCfpEVBZp2UPF+AIhFUL4gyV+FmHtll3hdiZjZE8sRMSkBDPm1jvzfOMPXbg/8LjkhSFYsUEr7rBBGWMcXWDVBikVcPrIlyhqLuFm8b3FgNCXW3fUvb1zoQMaLis9lnoZCMi1lYGayIiXdiCdja8xtwKKRpzatJgWClcoRhKg5fKBq/S4MMhuaVDkyZdYgf7Lg0eLcG54EcWfy8Njkgyq2chs0g4yApaTA1BxzIIDHZKy9UJu4bEt9htg91xd2IxNnK+jRJmxhrdwhJmdgnHvIlNii2Du8wmHn53jCPBX1j8gzRwNVJMgI9PkFnd2UjPlVv5SZ7CVenT+MK1nP76OkNbN3OZByVhz5VUg5AT/aSdWQanAHj06LmfNInSj2o+ViJ8mSfLvws3BbNS8BjrLJZEP/m1/RU+AaMscqqNBvrlAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTAxLTA3VDE1OjAxOjE2KzAwOjAw32e/YAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wMS0wN1QxNTowMToxNiswMDowMK46B9wAAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjMtMDEtMDdUMTU6MDE6MTcrMDA6MDBfWC23AAAAAElFTkSuQmCC"}');
;// ./node_modules/@babel/runtime/helpers/esm/defineProperty.js

function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}

;// ./src/components/primitives/pin.js



// Semi-automatic pin object. For stretching things.


var Pin = /*#__PURE__*/function () {
  // (Comp reference, a name in overlay settings,
  // pin parameters)
  function Pin(comp, name, params) {
    var _this = this;
    if (params === void 0) {
      params = {};
    }
    classCallCheck_classCallCheck(this, Pin);
    this.RADIUS = comp.$props.config.PIN_RADIUS || 5.5;
    this.RADIUS_SQ = Math.pow(this.RADIUS + 7, 2);
    if (utils.is_mobile) {
      this.RADIUS += 2;
      this.RADIUS_SQ *= 2.5;
    }
    this.COLOR_BACK = comp.$props.colors.back;
    this.COLOR_BR = comp.$props.colors.text;
    this.comp = comp;
    this.layout = comp.layout;
    this.mouse = comp.mouse;
    this.name = name;
    this.state = params.state || 'settled';
    this.hidden = params.hidden || false;
    this.mouse.on('mousemove', function (e) {
      return _this.mousemove(e);
    });
    this.mouse.on('mousedown', function (e) {
      return _this.mousedown(e);
    });
    this.mouse.on('mouseup', function (e) {
      return _this.mouseup(e);
    });
    if (comp.state === 'finished') {
      this.state = 'settled';
      this.update_from(comp.$props.settings[name]);
    } else {
      this.update();
    }
    if (this.state !== 'settled') {
      this.comp.$emit('scroll-lock', true);
    }
  }
  return createClass_createClass(Pin, [{
    key: "re_init",
    value: function re_init() {
      this.update_from(this.comp.$props.settings[this.name]);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (this.hidden) return;
      switch (this.state) {
        case 'tracking':
          break;
        case 'dragging':
          if (!this.moved) this.draw_circle(ctx);
          break;
        case 'settled':
          this.draw_circle(ctx);
          break;
      }
    }
  }, {
    key: "draw_circle",
    value: function draw_circle(ctx) {
      this.layout = this.comp.layout;
      if (this.comp.selected) {
        var r = this.RADIUS,
          lw = 1.5;
      } else {
        var r = this.RADIUS * 0.95,
          lw = 1;
      }
      ctx.lineWidth = lw;
      ctx.strokeStyle = this.COLOR_BR;
      ctx.fillStyle = this.COLOR_BACK;
      ctx.beginPath();
      ctx.arc(this.x = this.layout.t2screen(this.t), this.y = this.layout.$2screen(this.y$), r + 0.5, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.stroke();
    }
  }, {
    key: "update",
    value: function update() {
      this.y$ = this.comp.$props.cursor.y$;
      this.y = this.comp.$props.cursor.y;
      this.t = this.comp.$props.cursor.t;
      this.x = this.comp.$props.cursor.x;

      // Save pin as time in IB mode
      //if (this.layout.ti_map.ib) {
      //    this.t = this.layout.ti_map.i2t(this.t )
      //}

      // Reset the settings attahed to the pin (position)
      this.comp.$emit('change-settings', _defineProperty({}, this.name, [this.t, this.y$]));
    }
  }, {
    key: "update_from",
    value: function update_from(data, emit) {
      if (emit === void 0) {
        emit = false;
      }
      if (!data) return;
      this.layout = this.comp.layout;
      this.y$ = data[1];
      this.y = this.layout.$2screen(this.y$);
      this.t = data[0];
      this.x = this.layout.t2screen(this.t);

      // TODO: Save pin as time in IB mode
      //if (this.layout.ti_map.ib) {
      //    this.t = this.layout.ti_map.i2t(this.t )
      //}

      if (emit) this.comp.$emit('change-settings', _defineProperty({}, this.name, [this.t, this.y$]));
    }
  }, {
    key: "rec_position",
    value: function rec_position() {
      this.t1 = this.t;
      this.y$1 = this.y$;
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      switch (this.state) {
        case 'tracking':
        case 'dragging':
          this.moved = true;
          this.update();
          break;
      }
    }
  }, {
    key: "mousedown",
    value: function mousedown(event, force) {
      if (force === void 0) {
        force = false;
      }
      if (utils.default_prevented(event) && !force) return;
      switch (this.state) {
        case 'tracking':
          this.state = 'settled';
          if (this.on_settled) this.on_settled();
          this.comp.$emit('scroll-lock', false);
          break;
        case 'settled':
          if (this.hidden) return;
          if (this.hover()) {
            this.state = 'dragging';
            this.moved = false;
            this.comp.$emit('scroll-lock', true);
            this.comp.$emit('object-selected');
          }
          break;
      }
      if (this.hover()) {
        event.preventDefault();
      }
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      switch (this.state) {
        case 'dragging':
          this.state = 'settled';
          if (this.on_settled) this.on_settled();
          this.comp.$emit('scroll-lock', false);
          break;
      }
    }
  }, {
    key: "on",
    value: function on(name, handler) {
      switch (name) {
        case 'settled':
          this.on_settled = handler;
          break;
      }
    }
  }, {
    key: "hover",
    value: function hover() {
      var x = this.x;
      var y = this.y;
      return (x - this.mouse.x) * (x - this.mouse.x) + (y - this.mouse.y) * (y - this.mouse.y) < this.RADIUS_SQ;
    }
  }]);
}();

;// ./src/components/primitives/seg.js


// Draws a segment, adds corresponding collision f-n



var Seg = /*#__PURE__*/function () {
  // Overlay ref, canvas ctx
  function Seg(overlay, ctx) {
    classCallCheck_classCallCheck(this, Seg);
    this.ctx = ctx;
    this.comp = overlay;
    this.T = overlay.$props.config.TOOL_COLL;
    if (utils.is_mobile) this.T *= 2;
  }

  // p1[t, $], p2[t, $] (time-price coordinates)
  return createClass_createClass(Seg, [{
    key: "draw",
    value: function draw(p1, p2) {
      var layout = this.comp.$props.layout;
      var x1 = layout.t2screen(p1[0]);
      var y1 = layout.$2screen(p1[1]);
      var x2 = layout.t2screen(p2[0]);
      var y2 = layout.$2screen(p2[1]);
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.comp.collisions.push(this.make([x1, y1], [x2, y2]));
    }

    // Collision function. x, y - mouse coord.
  }, {
    key: "make",
    value: function make(p1, p2) {
      var _this = this;
      return function (x, y) {
        return math.point2seg([x, y], p1, p2) < _this.T;
      };
    }
  }]);
}();

;// ./src/components/primitives/line.js


// Draws a line, adds corresponding collision f-n



var Line = /*#__PURE__*/function () {
  // Overlay ref, canvas ctx
  function Line(overlay, ctx) {
    classCallCheck_classCallCheck(this, Line);
    this.ctx = ctx;
    this.comp = overlay;
    this.T = overlay.$props.config.TOOL_COLL;
    if (utils.is_mobile) this.T *= 2;
  }

  // p1[t, $], p2[t, $] (time-price coordinates)
  return createClass_createClass(Line, [{
    key: "draw",
    value: function draw(p1, p2) {
      var layout = this.comp.$props.layout;
      var x1 = layout.t2screen(p1[0]);
      var y1 = layout.$2screen(p1[1]);
      var x2 = layout.t2screen(p2[0]);
      var y2 = layout.$2screen(p2[1]);
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      var w = layout.width;
      var h = layout.height;
      // TODO: transform k (angle) to screen ratio
      // (this requires a new a2screen function)
      var k = (y2 - y1) / (x2 - x1);
      var s = Math.sign(x2 - x1 || y2 - y1);
      var dx = w * s * 2;
      var dy = w * k * s * 2;
      if (dy === Infinity) {
        dx = 0, dy = h * s;
      }
      this.ctx.moveTo(x2, y2);
      this.ctx.lineTo(x2 + dx, y2 + dy);
      if (!this.ray) {
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x1 - dx, y1 - dy);
      }
      this.comp.collisions.push(this.make([x1, y1], [x2, y2]));
    }

    // Collision function. x, y - mouse coord.
  }, {
    key: "make",
    value: function make(p1, p2) {
      var _this = this;
      var f = this.ray ? math.point2ray.bind(math) : math.point2line.bind(math);
      return function (x, y) {
        return f([x, y], p1, p2) < _this.T;
      };
    }
  }]);
}();

;// ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}

;// ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js


function _possibleConstructorReturn(t, e) {
  if (e && ("object" == typeof_typeof(e) || "function" == typeof e)) return e;
  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return _assertThisInitialized(t);
}

;// ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function _getPrototypeOf(t) {
  return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, _getPrototypeOf(t);
}

;// ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}

;// ./node_modules/@babel/runtime/helpers/esm/inherits.js

function _inherits(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: !0,
      configurable: !0
    }
  }), Object.defineProperty(t, "prototype", {
    writable: !1
  }), e && _setPrototypeOf(t, e);
}

;// ./src/components/primitives/ray.js





function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
// Draws a ray, adds corresponding collision f-n


var Ray = /*#__PURE__*/function (_Line) {
  function Ray(overlay, ctx) {
    var _this;
    classCallCheck_classCallCheck(this, Ray);
    _this = _callSuper(this, Ray, [overlay, ctx]);
    _this.ray = true;
    return _this;
  }
  _inherits(Ray, _Line);
  return createClass_createClass(Ray);
}(Line);

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/LineTool.vue?vue&type=script&lang=js
// Line drawing tool
// TODO: make an angle-snap when "Shift" is pressed








/* harmony default export */ const LineToolvue_type_script_lang_js = ({
  name: 'LineTool',
  mixins: [overlay, tool],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      return this.sett.color || '#42b28a';
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    tool: function tool() {
      return {
        // Descriptor for the tool
        group: 'Lines',
        icon: icons_namespaceObject["segment.png"],
        type: 'Segment',
        hint: 'This hint will be shown on hover',
        data: [],
        // Default data
        settings: {},
        // Default settings
        // Modifications
        mods: {
          'Extended': {
            // Rewrites the default setting fields
            settings: {
              extended: true
            },
            icon: icons_namespaceObject["extended.png"]
          },
          'Ray': {
            // Rewrites the default setting fields
            settings: {
              ray: true
            },
            icon: icons_namespaceObject["ray.png"]
          }
        }
      };
    },
    // Called after overlay mounted
    init: function init() {
      var _this = this;
      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, 'p1'));
      // Second one is following mouse until it clicks
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking'
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');
        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      if (this.sett.ray) {
        new Ray(this, ctx).draw(this.p1, this.p2);
      } else if (this.sett.extended) {
        new Line(this, ctx).draw(this.p1, this.p2);
      } else {
        new Seg(this, ctx).draw(this.p1, this.p2);
      }
      ctx.stroke();
      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['LineTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  }
});
;// ./src/components/overlays/LineTool.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_LineToolvue_type_script_lang_js = (LineToolvue_type_script_lang_js); 
;// ./src/components/overlays/LineTool.vue
var LineTool_render, LineTool_staticRenderFns
;



/* normalize component */
;
var LineTool_component = normalizeComponent(
  overlays_LineToolvue_type_script_lang_js,
  LineTool_render,
  LineTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const LineTool = (LineTool_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/RangeTool.vue?vue&type=script&lang=js

// Price/Time measurment tool






/* harmony default export */ const RangeToolvue_type_script_lang_js = ({
  name: 'RangeTool',
  mixins: [overlay, tool],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      return this.sett.color || this.$props.colors.cross;
    },
    back_color: function back_color() {
      return this.sett.backColor || '#9b9ba316';
    },
    value_back: function value_back() {
      return this.sett.valueBack || '#9b9ba316';
    },
    value_color: function value_color() {
      return this.sett.valueColor || this.$props.colors.text;
    },
    prec: function prec() {
      return this.sett.precision || 2;
    },
    new_font: function new_font() {
      return '12px ' + this.$props.font.split('px').pop();
    },
    price: function price() {
      return 'price' in this.sett ? this.sett.price : true;
    },
    time: function time() {
      return 'time' in this.sett ? this.sett.time : false;
    },
    shift: function shift() {
      return this.sett.shiftMode;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '2.0.1'
      };
    },
    tool: function tool() {
      return {
        // Descriptor for the tool
        group: 'Measurements',
        icon: icons_namespaceObject["price_range.png"],
        type: 'Price',
        hint: 'Price Range',
        data: [],
        // Default data
        settings: {},
        // Default settings
        mods: {
          'Time': {
            // Rewrites the default setting fields
            icon: icons_namespaceObject["time_range.png"],
            settings: {
              price: false,
              time: true
            }
          },
          'PriceTime': {
            // Rewrites the default setting fields
            icon: icons_namespaceObject["price_time.png"],
            settings: {
              price: true,
              time: true
            }
          },
          'ShiftMode': {
            // Rewrites the default setting fields
            settings: {
              price: true,
              time: true,
              shiftMode: true
            },
            hidden: true
          }
        }
      };
    },
    // Called after overlay mounted
    init: function init() {
      var _this = this;
      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, 'p1', {
        hidden: this.shift
      }));
      // Second one is following mouse until it clicks
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking',
        hidden: this.shift
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');
        _this.$emit('drawing-mode-off');
        // Deselect the tool in shiftMode
        if (_this.shift) _this._$emit('custom-event', {
          event: 'object-selected',
          args: []
        });
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      var dir = Math.sign(this.p2[1] - this.p1[1]);
      var layout = this.$props.layout;
      var xm = layout.t2screen((this.p1[0] + this.p2[0]) * 0.5);
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;

      // Background
      ctx.fillStyle = this.back_color;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      if (this.price) this.vertical(ctx, x1, y1, x2, y2, xm);
      if (this.time) this.horizontal(ctx, x1, y1, x2, y2, xm);
      this.draw_value(ctx, dir, xm, y2);
      this.render_pins(ctx);
    },
    vertical: function vertical(ctx, x1, y1, x2, y2, xm) {
      var layout = this.$props.layout;
      var dir = Math.sign(this.p2[1] - this.p1[1]);
      ctx.beginPath();
      if (!this.shift) {
        // Top
        new Seg(this, ctx).draw([this.p1[0], this.p2[1]], [this.p2[0], this.p2[1]]);
        // Bottom
        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p2[0], this.p1[1]]);
      }

      // Vertical Arrow
      ctx.moveTo(xm - 4, y2 + 5 * dir);
      ctx.lineTo(xm, y2);
      ctx.lineTo(xm + 4, y2 + 5 * dir);
      ctx.stroke();

      // Vertical Line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      new Seg(this, ctx).draw([(this.p1[0] + this.p2[0]) * 0.5, this.p2[1]], [(this.p1[0] + this.p2[0]) * 0.5, this.p1[1]]);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    horizontal: function horizontal(ctx, x1, y1, x2, y2, xm) {
      var layout = this.$props.layout;
      var xdir = Math.sign(this.p2[0] - this.p1[0]);
      var ym = (layout.$2screen(this.p1[1]) + layout.$2screen(this.p2[1])) / 2;
      ctx.beginPath();
      if (!this.shift) {
        // Left
        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p1[0], this.p2[1]]);
        // Right
        new Seg(this, ctx).draw([this.p2[0], this.p1[1]], [this.p2[0], this.p2[1]]);
      }

      // Horizontal Arrow
      ctx.moveTo(x2 - 5 * xdir, ym - 4);
      ctx.lineTo(x2, ym);
      ctx.lineTo(x2 - 5 * xdir, ym + 4);
      ctx.stroke();

      // Horizontal Line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(x1, ym);
      ctx.lineTo(x2, ym);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    // WTF? I know dude, a lot of shitty code here
    draw_value: function draw_value(ctx, dir, xm, y) {
      var _this2 = this;
      ctx.font = this.new_font;
      // Price delta (anf percent)
      //let d$ = (this.p2[1] - this.p1[1]).toFixed(this.prec)
      //let p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(this.prec)
      var d$ = (this.p2[1] - this.p1[1]).toFixed(2);
      var p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(2);
      // Map interval to the actual tf (in ms)
      var f = function f(t) {
        return _this2.layout.ti_map.smth2t(t);
      };
      var dt = f(this.p2[0]) - f(this.p1[0]);
      var tf = this.layout.ti_map.tf;
      // Bars count (through the candle index)
      var f2 = function f2(t) {
        var c = _this2.layout.c_magnet(t);
        var cn = _this2.layout.candles || _this2.layout.master_grid.candles;
        return cn.indexOf(c);
      };
      // Bars count (and handling the negative values)
      var b = f2(this.p2[0]) - f2(this.p1[0]);
      // Format time delta
      // Format time delta
      var dtstr = this.t2str(dt);
      var text = [];
      if (this.price) text.push("".concat(d$, "  (").concat(p, "%)"));
      if (this.time) text.push("".concat(b, " bars, ").concat(dtstr));
      text = text.join('\n');
      // "Multiple" fillText
      var lines = text.split('\n');
      var w = Math.max.apply(Math, _toConsumableArray(lines.map(function (x) {
        return ctx.measureText(x).width + 20;
      })).concat([100]));
      var n = lines.length;
      var h = 20 * n;
      ctx.fillStyle = this.value_back;
      ctx.fillRect(xm - w * 0.5, y - (10 + h) * dir, w, h * dir);
      ctx.fillStyle = this.value_color;
      ctx.textAlign = 'center';
      lines.forEach(function (l, i) {
        ctx.fillText(l, xm, y + (dir > 0 ? 20 * i - 20 * n + 5 : 20 * i + 25));
      });
    },
    // Formats time from ms to `1D 12h` for example
    t2str: function t2str(t) {
      var sign = Math.sign(t);
      var abs = Math.abs(t);
      var tfs = [[1000, 's', 60], [60000, 'm', 60], [3600000, 'h', 24], [86400000, 'D', 7], [604800000, 'W', 4], [2592000000, 'M', 12], [31536000000, 'Y', Infinity], [Infinity, 'Eternity', Infinity]];
      for (var i = 0; i < tfs.length; i++) {
        tfs[i][0] = Math.floor(abs / tfs[i][0]);
        if (tfs[i][0] === 0) {
          var p1 = tfs[i - 1];
          var p2 = tfs[i - 2];
          var txt = sign < 0 ? '-' : '';
          if (p1) {
            txt += p1.slice(0, 2).join('');
          }
          var n2 = p2 ? p2[0] - p1[0] * p2[2] : 0;
          if (p2 && n2) {
            txt += ' ';
            txt += "".concat(n2).concat(p2[1]);
          }
          return txt;
        }
      }
    },
    use_for: function use_for() {
      return ['RangeTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  }
});
;// ./src/components/overlays/RangeTool.vue?vue&type=script&lang=js
 /* harmony default export */ const overlays_RangeToolvue_type_script_lang_js = (RangeToolvue_type_script_lang_js); 
;// ./src/components/overlays/RangeTool.vue
var RangeTool_render, RangeTool_staticRenderFns
;



/* normalize component */
;
var RangeTool_component = normalizeComponent(
  overlays_RangeToolvue_type_script_lang_js,
  RangeTool_render,
  RangeTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const RangeTool = (RangeTool_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Grid.vue?vue&type=script&lang=js
function Gridvue_type_script_lang_js_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = Gridvue_type_script_lang_js_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function Gridvue_type_script_lang_js_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return Gridvue_type_script_lang_js_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? Gridvue_type_script_lang_js_arrayLikeToArray(r, a) : void 0; } }
function Gridvue_type_script_lang_js_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Sets up all layers/overlays for the grid with 'grid_id'


















/* harmony default export */ const Gridvue_type_script_lang_js = ({
  name: "Grid",
  components: {
    Crosshair: components_Crosshair,
    KeyboardListener: KeyboardListener
  },
  mixins: [canvas, uxlist],
  props: ["sub", "layout", "range", "interval", "cursor", "colors", "overlays", "width", "height", "data", "grid_id", "y_transform", "font", "tv_id", "config", "meta", "shaders", "enableZoom", "priceLine", "decimalPlace", "enableCrosshair"],
  data: function data() {
    var _this = this;
    return {
      layer_events: {
        "new-grid-layer": this.new_layer,
        "delete-grid-layer": this.del_layer,
        "show-grid-layer": function showGridLayer(d) {
          _this.renderer.show_hide_layer(d);
          _this.redraw();
        },
        "redraw-grid": this.redraw,
        "layer-meta-props": function layerMetaProps(d) {
          return _this.$emit("layer-meta-props", d);
        },
        "custom-event": function customEvent(d) {
          return _this.$emit("custom-event", d);
        }
      },
      keyboard_events: {
        "register-kb-listener": function registerKbListener(event) {
          _this.$emit("register-kb-listener", event);
        },
        "remove-kb-listener": function removeKbListener(event) {
          _this.$emit("remove-kb-listener", event);
        },
        keyup: function keyup(event) {
          if (!_this.is_active) return;
          _this.renderer.propagate("keyup", event);
        },
        keydown: function keydown(event) {
          if (!_this.is_active) return; // TODO: is this neeeded?
          _this.renderer.propagate("keydown", event);
        },
        keypress: function keypress(event) {
          if (!_this.is_active) return;
          _this.renderer.propagate("keypress", event);
        }
      }
    };
  },
  computed: {
    is_active: function is_active() {
      return this.$props.cursor.t !== undefined && this.$props.cursor.grid_id === this.$props.grid_id;
    }
  },
  watch: {
    enableZoom: function enableZoom() {
      // console.log("props:",enableZoom);
    },
    // enableCrosshair() {
    //   console.log("props:",enableCrosshair);
    // },
    range: {
      handler: function handler() {
        var _this2 = this;
        // TODO: Left-side render lag fix:
        // Overlay data is updated one tick later than
        // the main sub. Fast fix is to delay redraw()
        // call. It will be a solution until a better
        // one comes by.
        this.$nextTick(function () {
          return _this2.redraw();
        });
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        if (!this.$props.cursor.locked) this.redraw();
      },
      deep: true
    },
    overlays: {
      // Track changes in calc() functions
      handler: function handler(ovs) {
        var _iterator = Gridvue_type_script_lang_js_createForOfIteratorHelper(ovs),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var ov = _step.value;
            var _iterator2 = Gridvue_type_script_lang_js_createForOfIteratorHelper(this.$children),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var comp = _step2.value;
                if (typeof comp.id !== "string") continue;
                var tuple = comp.id.split("_");
                tuple.pop();
                if (tuple.join("_") === ov.name) {
                  comp.calc = ov.methods.calc;
                  if (!comp.calc) continue;
                  var calc = comp.calc.toString();
                  if (calc !== ov.__prevscript__) {
                    comp.exec_script();
                  }
                  ov.__prevscript__ = calc;
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      },
      deep: true
    },
    // Redraw on the shader list change
    shaders: function shaders(n, p) {
      this.redraw();
    }
  },
  created: function created() {
    var _this3 = this;
    // List of all possible overlays (builtin + custom)
    //console.log("this.$props",this.$props)
    this._list = [Spline, Splines, Range, Trades, Channel, Segment, Candles, Volume, Splitters, LineTool, RangeTool].concat(this.$props.overlays);
    this._registry = {};

    // We need to know which components we will use.
    // Custom overlay components overwrite built-ins:
    var tools = [];
    this._list.forEach(function (x, i) {
      var use_for = x.methods.use_for();
      if (x.methods.tool) tools.push({
        use_for: use_for,
        info: x.methods.tool()
      });
      use_for.forEach(function (indicator) {
        _this3._registry[indicator] = i;
      });
    });
    this.$emit("custom-event", {
      event: "register-tools",
      args: tools
    });
    this.$on("custom-event", function (e) {
      return _this3.on_ux_event(e, "grid");
    });
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  },
  mounted: function mounted() {
    var _this4 = this;
    //  console.log("props:",this.priceLine);
    var el = this.$refs["canvas"];
    this.renderer = new Grid(el, this);
    this.setup();
    this.$nextTick(function () {
      return _this4.redraw();
    });
  },
  methods: {
    new_layer: function new_layer(layer) {
      var _this5 = this;
      // console.log("new_layer",layer)
      this.$nextTick(function () {
        return _this5.renderer.new_layer(layer);
      });
    },
    del_layer: function del_layer(layer) {
      var _this6 = this;
      this.$nextTick(function () {
        return _this6.renderer.del_layer(layer);
      });
      var grid_id = this.$props.grid_id;
      this.$emit("custom-event", {
        event: "remove-shaders",
        args: [grid_id, layer]
      });
      // TODO: close all interfaces
      this.$emit("custom-event", {
        event: "remove-layer-meta",
        args: [grid_id, layer]
      });
      this.remove_all_ux(layer);
    },
    get_overlays: function get_overlays(h) {
      var _this7 = this;
      // Distributes overlay data & settings according
      // to this._registry; returns compo list
      var comp_list = [],
        count = {};
      var _iterator3 = Gridvue_type_script_lang_js_createForOfIteratorHelper(this.$props.data),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var d = _step3.value;
          var comp = this._list[this._registry[d.type]];
          if (comp) {
            if (comp.methods.calc) {
              comp = this.inject_renderer(comp);
            }
            comp_list.push({
              cls: comp,
              type: d.type,
              data: d.data,
              settings: d.settings,
              i0: d.i0,
              tf: d.tf,
              last: d.last
            });
            count[d.type] = 0;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return comp_list.map(function (x, i) {
        // console.log("x.settings",x.type,x.settings)
        return h(x.cls, {
          on: _this7.layer_events,
          attrs: Object.assign(_this7.common_props(), {
            id: "".concat(x.type, "_").concat(count[x.type]++),
            type: x.type,
            data: x.data,
            settings: x.settings,
            i0: x.i0,
            tf: x.tf,
            num: i,
            data_234: 12,
            grid_id: _this7.$props.grid_id,
            meta: _this7.$props.meta,
            last: x.last,
            tv_id: "".concat(_this7.tv_id)
          })
        });
      });
    },
    common_props: function common_props() {
      return {
        cursor: this.$props.cursor,
        enableZoom: this.$props.enableZoom,
        enableCrosshair: this.$props.enableCrosshair,
        colors: this.$props.colors,
        layout: this.$props.layout.grids[this.$props.grid_id],
        interval: this.$props.interval,
        sub: this.$props.sub,
        font: this.$props.font,
        config: this.$props.config,
        priceLine: this.$props.priceLine
      };
    },
    emit_ux_event: function emit_ux_event(e) {
      var e_pass = this.on_ux_event(e, "grid");
      if (e_pass) this.$emit("custom-event", e);
    },
    // Replace the current comp with 'renderer'
    inject_renderer: function inject_renderer(comp) {
      var src = comp.methods.calc();
      if (!src.conf || !src.conf.renderer || comp.__renderer__) {
        return comp;
      }

      // Search for an overlay with the target 'name'
      var f = this._list.find(function (x) {
        return x.name === src.conf.renderer;
      });
      if (!f) return comp;
      comp.mixins.push(f);
      comp.__renderer__ = src.conf.renderer;
      return comp;
    }
  },
  render: function render(h) {
    var id = this.$props.grid_id;
    var layout = this.$props.layout.grids[id];
    return this.create_canvas(h, "grid-".concat(id), {
      position: {
        x: 0,
        y: layout.offset || 0
      },
      attrs: {
        width: layout.width,
        height: layout.height,
        overflow: "hidden"
      },
      style: {
        backgroundColor: this.$props.colors.back
      },
      hs: [h(components_Crosshair, {
        props: this.common_props(),
        on: this.layer_events
      }), h(KeyboardListener, {
        on: this.keyboard_events
      }), h(UxLayer, {
        props: {
          id: id,
          tv_id: this.$props.tv_id,
          uxs: this.uxs,
          colors: this.$props.colors,
          config: this.$props.config,
          domData: 1,
          updater: Math.random()
        },
        on: {
          "custom-event": this.emit_ux_event
        }
      })].concat(this.get_overlays(h))
    });
  }
});
;// ./src/components/Grid.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Gridvue_type_script_lang_js = (Gridvue_type_script_lang_js); 
;// ./src/components/Grid.vue
var Grid_render, Grid_staticRenderFns
;



/* normalize component */
;
var Grid_component = normalizeComponent(
  components_Gridvue_type_script_lang_js,
  Grid_render,
  Grid_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Grid = (Grid_component.exports);
;// ./src/components/js/sidebar.js


function sidebar_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = sidebar_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function sidebar_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return sidebar_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? sidebar_arrayLikeToArray(r, a) : void 0; } }
function sidebar_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }



var PANHEIGHT;
var Sidebar = /*#__PURE__*/function () {
  function Sidebar(canvas, comp, side) {
    if (side === void 0) {
      side = "right";
    }
    classCallCheck_classCallCheck(this, Sidebar);
    PANHEIGHT = comp.config.PANHEIGHT;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.id = this.$p.grid_id;
    this.layout = this.$p.layout.grids[this.id];
    this.side = side;
    this.calc_range_function = this.calc_range_by_layout;
    this.listeners();
  }
  return createClass_createClass(Sidebar, [{
    key: "calc_range_by_layout",
    value: function calc_range_by_layout() {
      return [this.layout.$_hi, this.layout.$_lo];
    }
  }, {
    key: "listeners",
    value: function listeners() {
      var _this = this;
      var mc = this.mc = new hammer.Manager(this.canvas);
      mc.add(new hammer.Pan({
        direction: hammer.DIRECTION_VERTICAL,
        threshold: 0
      }));
      mc.add(new hammer.Tap({
        event: "doubletap",
        taps: 2,
        posThreshold: 50
      }));
      mc.on("panstart", function (event) {
        if (_this.$p.y_transform) {
          _this.zoom = _this.$p.y_transform.zoom;
        } else {
          _this.zoom = 1.0;
        }
        _this.y_range = [_this.layout.$_hi, _this.layout.$_lo];
        _this.drug = {
          y: event.center.y,
          z: _this.zoom,
          mid: math.log_mid(_this.y_range, _this.layout.height),
          A: _this.layout.A,
          B: _this.layout.B
        };
      });
      mc.on("panmove", function (event) {
        if (_this.drug) {
          _this.zoom = _this.calc_zoom(event);
          _this.comp.$emit("sidebar-transform", {
            grid_id: _this.id,
            zoom: _this.zoom,
            auto: false,
            range: _this.calc_range(),
            drugging: true
          });
          _this.update();
        }
      });
      mc.on("panend", function () {
        _this.drug = null;
        _this.comp.$emit("sidebar-transform", {
          grid_id: _this.id,
          drugging: false
        });
      });
      mc.on("doubletap", function () {
        _this.comp.$emit("sidebar-transform", {
          grid_id: _this.id,
          zoom: 1.0,
          auto: true
        });
        _this.zoom = 1.0;
        _this.update();
      });

      // TODO: Do later for mobile version
    }
  }, {
    key: "update",
    value: function update() {
      // Update reference to the grid
      this.layout = this.$p.layout.grids[this.id];
      var points = this.layout.ys;
      var x,
        y,
        w,
        h,
        side = this.side;
      var sb = this.layout.sb;

      //this.ctx.fillStyle = this.$p.colors.back
      this.ctx.font = this.$p.font;
      switch (side) {
        case "left":
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height;

          //this.ctx.fillRect(x, y, w, h)
          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;
        case "right":
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height;
          //this.ctx.fillRect(x, y, w, h)
          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;
      }
      this.ctx.fillStyle = this.$p.colors.text;
      this.ctx.beginPath();
      var _iterator = sidebar_createForOfIteratorHelper(points),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          if (p[0] > this.layout.height) continue;
          var x1 = side === "left" ? w - 0.5 : x - 0.5;
          var x2 = side === "left" ? x1 - 4.5 : x1 + 4.5;
          this.ctx.moveTo(x1, p[0] - 0.5);
          this.ctx.lineTo(x2, p[0] - 0.5);
          var offst = side === "left" ? -10 : 10;
          this.ctx.textAlign = side === "left" ? "end" : "start";
          this.ctx.fillText(p[1].toFixed(this.$p.decimalPlace), x1 + offst, p[0] + 4);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.ctx.stroke();
      if (this.$p.grid_id) this.upper_border();
      this.apply_shaders();
      if (this.$p.cursor.y && this.$p.cursor.y$) this.panel();
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      if (this.$p.applyShaders) {
        var layout = this.$p.layout.grids[this.id];
        var props = {
          layout: layout,
          cursor: this.$p.cursor
        };
        var _iterator2 = sidebar_createForOfIteratorHelper(this.$p.shaders),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var s = _step2.value;
            this.ctx.save();
            s.draw(this.ctx, props);
            this.ctx.restore();
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    }

    // A gray bar behind the current price
  }, {
    key: "panel",
    value: function panel() {
      if (this.$p.cursor.grid_id !== this.layout.id) {
        return;
      }

      //let lbl = this.$p.cursor.y$.toFixed(this.layout.prec)
      // console.log("this.$p.cursor.y$", this.$p.enableSideBarBoxValue);
      var lbl = this.$p.cursor.y$.toFixed(3);
      if (this.$p.enableSideBarBoxValue) {
        var roundOffValue = this.$p.cursor.y$ < 1.00 ? 3 : this.$p.cursor.y$ < 0.01 ? 4 : 2;
        lbl = this.$p.cursor.y$.toFixed(roundOffValue);
      }
      // else {
      //    lbl = this.$p.cursor.y$.toFixed(2);
      // }
      // let lbl = this.$p.cursor.y$.toFixed(this.$p.decimalPlace);
      this.ctx.fillStyle = this.$p.colors.panel;
      var panwidth = this.layout.sb + 1;
      var x = -0.5;
      var y = this.$p.cursor.y - PANHEIGHT * 0.5 - 0.5;
      var a = 7;
      this.ctx.fillRect(x - 0.5, y, panwidth, PANHEIGHT);
      this.ctx.fillStyle = this.$p.colors.textHL;
      this.ctx.textAlign = "left";
      var formattedNumber = parseFloat(lbl).toLocaleString();
      this.ctx.fillText(formattedNumber, a, y + 15);
    }
  }, {
    key: "calc_zoom",
    value: function calc_zoom(event) {
      var d = this.drug.y - event.center.y;
      var speed = d > 0 ? 3 : 1;
      var k = 1 + speed * d / this.layout.height;
      return utils.clamp(this.drug.z * k, 0.005, 100);
    }

    // Not the best place to calculate y-range but
    // this is the simplest solution I found up to
    // date
  }, {
    key: "calc_range",
    value: function calc_range(diff1, diff2) {
      var _this2 = this;
      if (diff1 === void 0) {
        diff1 = 1;
      }
      if (diff2 === void 0) {
        diff2 = 1;
      }
      var z = this.zoom / this.drug.z;
      var zk = (1 / z - 1) / 2;
      var range = this.y_range.slice();
      var delta = range[0] - range[1];
      if (!this.layout.grid.logScale) {
        range[0] = range[0] + delta * zk * diff1;
        range[1] = range[1] - delta * zk * diff2;
      } else {
        var px_mid = this.layout.height / 2;
        var new_hi = px_mid - px_mid * (1 / z);
        var new_lo = px_mid + px_mid * (1 / z);

        // Use old mapping to get a new range
        var f = function f(y) {
          return math.exp((y - _this2.drug.B) / _this2.drug.A);
        };
        var copy = range.slice();
        range[0] = f(new_hi);
        range[1] = f(new_lo);
      }
      return range;
    }
  }, {
    key: "rezoom_range",
    value: function rezoom_range(delta, diff1, diff2) {
      if (!this.$p.y_transform || this.$p.y_transform.auto) return;
      this.zoom = 1.0;
      // TODO: further work (improve scaling ratio)
      if (delta < 0) delta /= 3.75; // Btw, idk why 3.75, but it works
      delta *= 0.25;
      this.y_range = [this.layout.$_hi, this.layout.$_lo];
      this.drug = {
        y: 0,
        z: this.zoom,
        mid: math.log_mid(this.y_range, this.layout.height),
        A: this.layout.A,
        B: this.layout.B
      };
      this.zoom = this.calc_zoom({
        center: {
          y: delta * this.layout.height
        }
      });
      this.comp.$emit("sidebar-transform", {
        grid_id: this.id,
        zoom: this.zoom,
        auto: false,
        range: this.calc_range(diff1, diff2),
        drugging: true
      });
      this.drug = null;
      this.comp.$emit("sidebar-transform", {
        grid_id: this.id,
        drugging: false
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.mc) this.mc.destroy();
    }
  }, {
    key: "mousemove",
    value: function mousemove() {}
  }, {
    key: "mouseout",
    value: function mouseout() {}
  }, {
    key: "mouseup",
    value: function mouseup() {}
  }, {
    key: "mousedown",
    value: function mousedown() {}
  }]);
}();

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Sidebar.vue?vue&type=script&lang=js
// The side bar (yep, that thing with a bunch of $$$)



/* harmony default export */ const Sidebarvue_type_script_lang_js = ({
  name: 'Sidebar',
  mixins: [canvas],
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'grid_id', 'enableSideBarBoxValue', 'rerender', 'y_transform', 'decimalPlace', 'applyShaders', 'tv_id', 'config', 'shaders'],
  watch: {
    range: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    rerender: function rerender() {
      var _this = this;
      this.$nextTick(function () {
        return _this.redraw();
      });
    }
  },
  mounted: function mounted() {
    var el = this.$refs['canvas'];
    this.renderer = new Sidebar(el, this);
    this.setup();
    this.redraw();
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  },
  render: function render(h) {
    var id = this.$props.grid_id;
    var layout = this.$props.layout.grids[id];
    return this.create_canvas(h, "sidebar-".concat(id), {
      position: {
        x: layout.width,
        y: layout.offset || 0
      },
      attrs: {
        rerender: this.$props.rerender,
        width: this.$props.width,
        height: layout.height
      },
      style: {
        backgroundColor: this.$props.colors.back
      }
    });
  }
});
;// ./src/components/Sidebar.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Sidebarvue_type_script_lang_js = (Sidebarvue_type_script_lang_js); 
;// ./src/components/Sidebar.vue
var Sidebar_render, Sidebar_staticRenderFns
;



/* normalize component */
;
var Sidebar_component = normalizeComponent(
  components_Sidebarvue_type_script_lang_js,
  Sidebar_render,
  Sidebar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Sidebar = (Sidebar_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=template&id=19ffa78a
var Legendvue_type_template_id_19ffa78a_render = function render() {
  var _vm$common;
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    staticClass: "trading-vue-legend",
    style: _vm.calc_style
  }, [_vm.grid_id === 0 && !_vm.showTitleChartLegend ? _c('div', {
    staticClass: "trading-vue-ohlcv",
    style: {
      'max-width': _vm.common.width + 'px'
    }
  }, [(_vm$common = _vm.common) !== null && _vm$common !== void 0 && _vm$common.showLegendPropsData && _vm.common.showLegendPropsData.length ? [_vm._l(_vm.common.showLegendPropsData, function (n, i) {
    return _c('b', {
      key: i
    }, [_vm._v(_vm._s(n.k) + " : " + _vm._s(n.v) + " ")]);
  }), _c('br')] : _vm._e(), _vm._v(" "), _vm.show_CustomProps ? _vm._l(_vm.legendTxtConfig, function (n, i) {
    return _c('span', {
      key: i,
      style: n.style
    }, [_vm._v(_vm._s(n.name) + " ")]);
  }) : _vm._e(), _vm._v(" "), !_vm.show_CustomProps ? _c('span', {
    staticClass: "t-vue-title",
    style: {
      color: _vm.common.colors.title
    }
  }, [_vm._v("\n            " + _vm._s(_vm.common.title_txt) + "\n        ")]) : _vm._e(), _vm._v(" "), _vm.show_values && !_vm.show_CustomProps ? _c('span', [_vm._v("\n            O"), _c('span', {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[0]))]), _vm._v("\n            H"), _c('span', {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[1]))]), _vm._v("\n            L"), _c('span', {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[2]))]), _vm._v("\n            C"), _c('span', {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[3]))]), _vm._v("\n            V"), _c('span', {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[4]))])]) : _vm._e(), _vm._v(" "), !_vm.show_values ? _c('span', {
    staticClass: "t-vue-lspan",
    style: {
      color: _vm.common.colors.text
    }
  }, [_vm._v("\n            " + _vm._s((_vm.common.meta.last || [])[4]) + "\n        ")]) : _vm._e()], 2) : _vm._e(), _vm._v(" "), _vm.isButtonvisible && _vm.isOverlayCollapsed ? _c('button', {
    staticClass: "p-button p-component p-button-sm collapse-btn",
    staticStyle: {
      "cursor": "pointer",
      "pointer-events": "all"
    },
    attrs: {
      "type": "button"
    },
    on: {
      "click": function click($event) {
        return _vm.collapse_button_click(false);
      }
    }
  }, [_c('span', {
    staticClass: "pi pi-angle-down p-button-icon p-button-icon-left"
  }), _vm._v(" "), _c('span', {
    staticClass: "p-button-label"
  }, [_vm._v(_vm._s(this.indicators.length))])]) : _vm._e(), _vm._v(" "), _vm._l(this.indicators, function (ind) {
    return _vm.isIndicatorVisible ? _c('div', {
      staticClass: "t-vue-ind"
    }, [_c('span', {
      staticClass: "t-vue-iname"
    }, [_vm._v(_vm._s(ind.name))]), _vm._v(" "), ind.showLegendButtons ? _c('button-group', {
      attrs: {
        "buttons": _vm.common.buttons,
        "config": _vm.common.config,
        "ov_id": ind.id,
        "grid_id": _vm.grid_id,
        "index": ind.index,
        "tv_id": _vm.common.tv_id,
        "display": ind.v
      },
      on: {
        "legend-button-click": _vm.button_click
      }
    }) : _vm._e(), _vm._v(" "), ind.v ? _c('span', {
      staticClass: "t-vue-ivalues"
    }, _vm._l(ind.values, function (v) {
      return _vm.show_values ? _c('span', {
        staticClass: "t-vue-lspan t-vue-ivalue",
        style: {
          color: v.color
        }
      }, [_vm._v("\n                " + _vm._s(v.value) + "\n            ")]) : _vm._e();
    }), 0) : _vm._e(), _vm._v(" "), ind.unk ? _c('span', {
      staticClass: "t-vue-unknown"
    }, [_vm._v("\n            (Unknown type)\n        ")]) : _vm._e(), _vm._v(" "), _c('transition', {
      attrs: {
        "name": "tvjs-appear"
      }
    }, [ind.loading ? _c('spinner', {
      attrs: {
        "colors": _vm.common.colors
      }
    }) : _vm._e()], 1)], 1) : _vm._e();
  }), _vm._v(" "), _vm.isButtonvisible && !_vm.isOverlayCollapsed ? _c('button', {
    staticClass: "p-button p-component p-button-sm collapse-btn",
    staticStyle: {
      "cursor": "pointer",
      "pointer-events": "all"
    },
    attrs: {
      "type": "button"
    },
    on: {
      "click": function click($event) {
        return _vm.collapse_button_click(true);
      }
    }
  }, [_c('span', {
    staticClass: "pi pi-angle-up p-button-icon"
  })]) : _vm._e()], 2);
};
var Legendvue_type_template_id_19ffa78a_staticRenderFns = [];
Legendvue_type_template_id_19ffa78a_render._withStripped = true;

;// ./src/components/Legend.vue?vue&type=template&id=19ffa78a

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=template&id=72b6dd45
var ButtonGroupvue_type_template_id_72b6dd45_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('span', {
    staticClass: "t-vue-lbtn-grp"
  }, _vm._l(_vm.buttons, function (b, i) {
    return _c('legend-button', {
      key: i,
      attrs: {
        "id": b.name || b,
        "tv_id": _vm.tv_id,
        "ov_id": _vm.ov_id,
        "grid_id": _vm.grid_id,
        "index": _vm.index,
        "display": _vm.display,
        "icon": b.icon,
        "config": _vm.config
      },
      on: {
        "legend-button-click": _vm.button_click
      }
    });
  }), 1);
};
var ButtonGroupvue_type_template_id_72b6dd45_staticRenderFns = [];
ButtonGroupvue_type_template_id_72b6dd45_render._withStripped = true;

;// ./src/components/ButtonGroup.vue?vue&type=template&id=72b6dd45

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=template&id=7cd34a30
var LegendButtonvue_type_template_id_7cd34a30_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('img', {
    staticClass: "t-vue-lbtn",
    style: {
      width: _vm.config.L_BTN_SIZE + 'px',
      height: _vm.config.L_BTN_SIZE + 'px'
    },
    attrs: {
      "id": _vm.uuid,
      "src": _vm.base64
    },
    on: {
      "click": _vm.onclick
    }
  });
};
var LegendButtonvue_type_template_id_7cd34a30_staticRenderFns = [];
LegendButtonvue_type_template_id_7cd34a30_render._withStripped = true;

;// ./src/components/LegendButton.vue?vue&type=template&id=7cd34a30

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=script&lang=js

/* harmony default export */ const LegendButtonvue_type_script_lang_js = ({
  name: 'LegendButton',
  props: ['id', 'tv_id', 'grid_id', 'ov_id', 'index', 'display', 'icon', 'config'],
  computed: {
    base64: function base64() {
      return this.icon || icons_namespaceObject[this.file_name];
    },
    file_name: function file_name() {
      var id = this.$props.id;
      if (this.$props.id === 'display') {
        id = this.$props.display ? 'display_on' : 'display_off';
      }
      return id + '.png';
    },
    uuid: function uuid() {
      var tv = this.$props.tv_id;
      var gr = this.$props.grid_id;
      var ov = this.$props.ov_id;
      return "".concat(tv, "-btn-g").concat(gr, "-").concat(ov);
    },
    data_type: function data_type() {
      return this.$props.grid_id === 0 ? 'onchart' : 'offchart';
    },
    data_index: function data_index() {
      return this.$props.index;
    }
  },
  mounted: function mounted() {},
  methods: {
    onclick: function onclick() {
      this.$emit('legend-button-click', {
        button: this.$props.id,
        type: this.data_type,
        dataIndex: this.data_index,
        grid: this.$props.grid_id,
        overlay: this.$props.ov_id
      });
    }
  }
});
;// ./src/components/LegendButton.vue?vue&type=script&lang=js
 /* harmony default export */ const components_LegendButtonvue_type_script_lang_js = (LegendButtonvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=style&index=0&id=7cd34a30&prod&lang=css
var LegendButtonvue_type_style_index_0_id_7cd34a30_prod_lang_css = __webpack_require__(179);
;// ./src/components/LegendButton.vue?vue&type=style&index=0&id=7cd34a30&prod&lang=css

;// ./src/components/LegendButton.vue



;


/* normalize component */

var LegendButton_component = normalizeComponent(
  components_LegendButtonvue_type_script_lang_js,
  LegendButtonvue_type_template_id_7cd34a30_render,
  LegendButtonvue_type_template_id_7cd34a30_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const LegendButton = (LegendButton_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=script&lang=js

/* harmony default export */ const ButtonGroupvue_type_script_lang_js = ({
  name: 'ButtonGroup',
  components: {
    LegendButton: LegendButton
  },
  props: ['buttons', 'tv_id', 'ov_id', 'grid_id', 'index', 'display', 'config'],
  methods: {
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    }
  }
});
;// ./src/components/ButtonGroup.vue?vue&type=script&lang=js
 /* harmony default export */ const components_ButtonGroupvue_type_script_lang_js = (ButtonGroupvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=style&index=0&id=72b6dd45&prod&lang=css
var ButtonGroupvue_type_style_index_0_id_72b6dd45_prod_lang_css = __webpack_require__(834);
;// ./src/components/ButtonGroup.vue?vue&type=style&index=0&id=72b6dd45&prod&lang=css

;// ./src/components/ButtonGroup.vue



;


/* normalize component */

var ButtonGroup_component = normalizeComponent(
  components_ButtonGroupvue_type_script_lang_js,
  ButtonGroupvue_type_template_id_72b6dd45_render,
  ButtonGroupvue_type_template_id_72b6dd45_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ButtonGroup = (ButtonGroup_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=template&id=a6fff878
var Spinnervue_type_template_id_a6fff878_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    staticClass: "tvjs-spinner"
  }, _vm._l(4, function (i) {
    return _c('div', {
      key: i,
      style: {
        background: _vm.colors.text
      }
    });
  }), 0);
};
var Spinnervue_type_template_id_a6fff878_staticRenderFns = [];
Spinnervue_type_template_id_a6fff878_render._withStripped = true;

;// ./src/components/Spinner.vue?vue&type=template&id=a6fff878

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=script&lang=js
/* harmony default export */ const Spinnervue_type_script_lang_js = ({
  name: 'Spinner',
  props: ['colors']
});
;// ./src/components/Spinner.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Spinnervue_type_script_lang_js = (Spinnervue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=style&index=0&id=a6fff878&prod&lang=css
var Spinnervue_type_style_index_0_id_a6fff878_prod_lang_css = __webpack_require__(688);
;// ./src/components/Spinner.vue?vue&type=style&index=0&id=a6fff878&prod&lang=css

;// ./src/components/Spinner.vue



;


/* normalize component */

var Spinner_component = normalizeComponent(
  components_Spinnervue_type_script_lang_js,
  Spinnervue_type_template_id_a6fff878_render,
  Spinnervue_type_template_id_a6fff878_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Spinner = (Spinner_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=script&lang=js




var settingPng = icons_namespaceObject["gear.png"];
/* harmony default export */ const Legendvue_type_script_lang_js = ({
  name: 'ChartLegend',
  components: {
    LegendButton: LegendButton,
    ButtonGroup: ButtonGroup,
    Spinner: Spinner
  },
  props: ['common', 'values', 'decimalPlace', 'grid_id', 'meta_props', 'legendDecimal', 'showTitleChartLegend', 'isOverlayCollapsed', 'collpaseButton'],
  computed: {
    isButtonvisible: function isButtonvisible() {
      return this.grid_id == 0 && this.collpaseButton && this.indicators.length > 0;
    },
    isIndicatorVisible: function isIndicatorVisible() {
      if (this.grid_id == 0 && this.collpaseButton) {
        return !this.isOverlayCollapsed;
      }
      return true;
    },
    show_CustomProps: function show_CustomProps() {
      var _this$common;
      return ((_this$common = this.common) === null || _this$common === void 0 ? void 0 : _this$common.show_CustomProps) || false;
    },
    show_Settings: function show_Settings() {
      var _this$common2;
      return ((_this$common2 = this.common) === null || _this$common2 === void 0 ? void 0 : _this$common2.showSettingsMain) || false;
    },
    settingIcon: function settingIcon() {
      return settingPng;
    },
    legendTxtConfig: function legendTxtConfig() {
      var _this$common3;
      return (_this$common3 = this.common) === null || _this$common3 === void 0 ? void 0 : _this$common3.legendTxtConfig;
    },
    ohlcv: function ohlcv() {
      if (!this.$props.values || !this.$props.values.ohlcv) {
        return Array(6).fill('n/a');
      }
      // const prec = this.layout.prec
      var prec = this.decimalPlace;
      // const prec = 3
      // TODO: main the main legend more customizable
      var id = this.main_type + '_0';
      var meta = this.$props.meta_props[id] || {};
      if (meta.legend) {
        return (meta.legend() || []).map(function (x) {
          return x.value;
        });
      }
      if (this.$props.legendDecimal) {
        return [this.$props.values.ohlcv[1].toFixed(this.$props.values.ohlcv[1] < 1 ? 3 : 2), this.$props.values.ohlcv[2].toFixed(this.$props.values.ohlcv[2] < 1 ? 3 : 2), this.$props.values.ohlcv[3].toFixed(this.$props.values.ohlcv[3] < 1 ? 3 : 2), this.$props.values.ohlcv[4].toFixed(this.$props.values.ohlcv[4] < 1 ? 3 : 2), this.$props.values.ohlcv[5] ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString('en-AU') : 'n/a'];
      } else {
        return [this.$props.values.ohlcv[1].toFixed(prec), this.$props.values.ohlcv[2].toFixed(prec), this.$props.values.ohlcv[3].toFixed(prec), this.$props.values.ohlcv[4].toFixed(prec), this.$props.values.ohlcv[5] ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString('en-AU') : 'n/a'];
      }
    },
    // TODO: add support for { grid: { id : N }}
    indicators: function indicators() {
      var _this = this;
      var values = this.$props.values;
      var f = this.format;
      var types = {};
      return this.json_data.filter(function (x) {
        return x.settings.legend !== false && !x.main;
      }).map(function (x) {
        if (!(x.type in types)) types[x.type] = 0;
        var id = x.type + "_".concat(types[x.type]++);
        return {
          v: 'display' in x.settings ? x.settings.display : true,
          name: x.name || id,
          index: (_this.off_data || _this.json_data).indexOf(x),
          id: id,
          values: values ? f(id, values) : _this.n_a(1),
          unk: !(id in (_this.$props.meta_props || {})),
          loading: x.loading,
          showLegendButtons: 'legendButtons' in x.settings ? x.settings.legendButtons : true
        };
      });
    },
    calc_style: function calc_style() {
      var top = this.layout.height > 150 ? 10 : 5;
      var grids = this.$props.common.layout.grids;
      var w = grids[0] ? grids[0].width : undefined;
      return {
        top: "".concat(this.layout.offset + top, "px"),
        width: "".concat(w - 20, "px")
      };
    },
    layout: function layout() {
      var id = this.$props.grid_id;
      return this.$props.common.layout.grids[id];
    },
    json_data: function json_data() {
      return this.$props.common.data;
    },
    off_data: function off_data() {
      return this.$props.common.offchart;
    },
    main_type: function main_type() {
      var f = this.common.data.find(function (x) {
        return x.main;
      });
      return f ? f.type : undefined;
    },
    show_values: function show_values() {
      return this.common.cursor.mode !== 'explore';
    }
  },
  methods: {
    format: function format(id, values) {
      var meta = this.$props.meta_props[id] || {};
      // Matches Overlay.data_colors with the data values
      // (see Spline.vue)
      if (!values[id]) return this.n_a(1);

      // Custom formatter
      if (meta.legend) return meta.legend(values[id]);
      return values[id].slice(1).map(function (x, i) {
        var cs = meta.data_colors ? meta.data_colors() : [];
        if (typeof x == 'number') {
          // Show 8 digits for small values
          x = x.toFixed(Math.abs(x) > 0.001 ? 4 : 8);
        }
        return {
          value: x,
          color: cs ? cs[i % cs.length] : undefined
        };
      });
    },
    n_a: function n_a(len) {
      return Array(len).fill({
        value: 'n/a'
      });
    },
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    },
    collapse_button_click: function collapse_button_click(value) {
      this.$emit('on-collapse-change', value);
    }
  }
});
;// ./src/components/Legend.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Legendvue_type_script_lang_js = (Legendvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=style&index=0&id=19ffa78a&prod&lang=css
var Legendvue_type_style_index_0_id_19ffa78a_prod_lang_css = __webpack_require__(305);
;// ./src/components/Legend.vue?vue&type=style&index=0&id=19ffa78a&prod&lang=css

;// ./src/components/Legend.vue



;


/* normalize component */

var Legend_component = normalizeComponent(
  components_Legendvue_type_script_lang_js,
  Legendvue_type_template_id_19ffa78a_render,
  Legendvue_type_template_id_19ffa78a_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Legend = (Legend_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TitleLegend.vue?vue&type=template&id=7fdc78e5
var TitleLegendvue_type_template_id_7fdc78e5_render = function render() {
  var _vm$common;
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    staticClass: "trading-vue-legend title-legend",
    style: _vm.calc_style
  }, [_vm.grid_id === 0 && _vm.showTitleChartLegend ? _c('div', {
    staticClass: "trading-vue-ohlcv",
    style: {
      'max-width': _vm.common.width + 'px'
    }
  }, [(_vm$common = _vm.common) !== null && _vm$common !== void 0 && _vm$common.showLegendPropsData && _vm.common.showLegendPropsData.length ? [_vm._l(_vm.common.showLegendPropsData, function (n, i) {
    return _c('b', {
      key: i
    }, [_vm._v(_vm._s(n.k) + " : " + _vm._s(n.v) + " ")]);
  }), _c('br')] : _vm._e(), _vm._v(" "), _vm.show_CustomProps ? _vm._l(_vm.legendTxtConfig, function (n, i) {
    return _c('span', {
      key: i,
      style: n.style
    }, [_vm._v(_vm._s(n.name) + " ")]);
  }) : _vm._e(), _vm._v(" "), !_vm.show_CustomProps ? _c('span', {
    staticClass: "t-vue-title",
    style: {
      color: _vm.common.colors.title
    }
  }, [_vm._v("\r\n              " + _vm._s(_vm.common.title_txt) + "\r\n        ")]) : _vm._e(), _vm._v(" "), _vm.show_values && !_vm.show_CustomProps ? _c('span', [_vm._v("\r\n            O"), _c('span', {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[0]))]), _vm._v("\r\n            H"), _c('span', {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[1]))]), _vm._v("\r\n            L"), _c('span', {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[2]))]), _vm._v("\r\n            C"), _c('span', {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[3]))]), _vm._v("\r\n            V"), _c('span', {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[4]))])]) : _vm._e(), _vm._v(" "), !_vm.show_values ? _c('span', {
    staticClass: "t-vue-lspan",
    style: {
      color: _vm.common.colors.text
    }
  }, [_vm._v("\r\n            " + _vm._s((_vm.common.meta.last || [])[4]) + "\r\n        ")]) : _vm._e()], 2) : _vm._e()]);
};
var TitleLegendvue_type_template_id_7fdc78e5_staticRenderFns = [];
TitleLegendvue_type_template_id_7fdc78e5_render._withStripped = true;

;// ./src/components/TitleLegend.vue?vue&type=template&id=7fdc78e5

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TitleLegend.vue?vue&type=script&lang=js




var TitleLegendvue_type_script_lang_js_settingPng = icons_namespaceObject["gear.png"];
/* harmony default export */ const TitleLegendvue_type_script_lang_js = ({
  name: 'TitleChartLegend',
  components: {
    LegendButton: LegendButton,
    ButtonGroup: ButtonGroup,
    Spinner: Spinner
  },
  props: ['common', 'values', 'decimalPlace', 'grid_id', 'meta_props', 'legendDecimal', 'showTitleChartLegend'],
  computed: {
    show_CustomProps: function show_CustomProps() {
      var _this$common;
      return ((_this$common = this.common) === null || _this$common === void 0 ? void 0 : _this$common.show_CustomProps) || false;
    },
    show_Settings: function show_Settings() {
      var _this$common2;
      return ((_this$common2 = this.common) === null || _this$common2 === void 0 ? void 0 : _this$common2.showSettingsMain) || false;
    },
    settingIcon: function settingIcon() {
      return TitleLegendvue_type_script_lang_js_settingPng;
    },
    legendTxtConfig: function legendTxtConfig() {
      var _this$common3;
      return (_this$common3 = this.common) === null || _this$common3 === void 0 ? void 0 : _this$common3.legendTxtConfig;
    },
    ohlcv: function ohlcv() {
      if (!this.$props.values || !this.$props.values.ohlcv) {
        return Array(6).fill('n/a');
      }
      // const prec = this.layout.prec
      var prec = this.decimalPlace;
      // const prec = 3
      // TODO: main the main legend more customizable
      var id = this.main_type + '_0';
      var meta = this.$props.meta_props[id] || {};
      if (meta.legend) {
        return (meta.legend() || []).map(function (x) {
          return x.value;
        });
      }
      if (this.$props.legendDecimal) {
        return [this.$props.values.ohlcv[1].toFixed(this.$props.values.ohlcv[1] < 1 ? 3 : 2), this.$props.values.ohlcv[2].toFixed(this.$props.values.ohlcv[2] < 1 ? 3 : 2), this.$props.values.ohlcv[3].toFixed(this.$props.values.ohlcv[3] < 1 ? 3 : 2), this.$props.values.ohlcv[4].toFixed(this.$props.values.ohlcv[4] < 1 ? 3 : 2), this.$props.values.ohlcv[5] ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString('en-AU') : 'n/a'];
      } else {
        return [this.$props.values.ohlcv[1].toFixed(prec), this.$props.values.ohlcv[2].toFixed(prec), this.$props.values.ohlcv[3].toFixed(prec), this.$props.values.ohlcv[4].toFixed(prec), this.$props.values.ohlcv[5] ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString('en-AU') : 'n/a'];
      }
    },
    // TODO: add support for { grid: { id : N }}
    indicators: function indicators() {
      var _this = this;
      var values = this.$props.values;
      var f = this.format;
      var types = {};
      return this.json_data.filter(function (x) {
        return x.settings.legend !== false && !x.main;
      }).map(function (x) {
        if (!(x.type in types)) types[x.type] = 0;
        var id = x.type + "_".concat(types[x.type]++);
        return {
          v: 'display' in x.settings ? x.settings.display : true,
          name: x.name || id,
          index: (_this.off_data || _this.json_data).indexOf(x),
          id: id,
          values: values ? f(id, values) : _this.n_a(1),
          unk: !(id in (_this.$props.meta_props || {})),
          loading: x.loading,
          showLegendButtons: 'legendButtons' in x.settings ? x.settings.legendButtons : true
        };
      });
    },
    calc_style: function calc_style() {
      var top = this.layout.height > 150 ? 3 : 1;
      var grids = this.$props.common.layout.grids;
      var w = grids[0] ? grids[0].width : undefined;
      return {
        top: "".concat(this.layout.offset + top, "px"),
        width: "".concat(w - 20, "px")
      };
    },
    layout: function layout() {
      var id = this.$props.grid_id;
      return this.$props.common.layout.grids[id];
    },
    json_data: function json_data() {
      return this.$props.common.data;
    },
    off_data: function off_data() {
      return this.$props.common.offchart;
    },
    main_type: function main_type() {
      var f = this.common.data.find(function (x) {
        return x.main;
      });
      return f ? f.type : undefined;
    },
    show_values: function show_values() {
      return this.common.cursor.mode !== 'explore';
    }
  },
  methods: {
    format: function format(id, values) {
      var meta = this.$props.meta_props[id] || {};
      // Matches Overlay.data_colors with the data values
      // (see Spline.vue)
      if (!values[id]) return this.n_a(1);

      // Custom formatter
      if (meta.legend) return meta.legend(values[id]);
      return values[id].slice(1).map(function (x, i) {
        var cs = meta.data_colors ? meta.data_colors() : [];
        if (typeof x == 'number') {
          // Show 8 digits for small values
          x = x.toFixed(Math.abs(x) > 0.001 ? 4 : 8);
        }
        return {
          value: x,
          color: cs ? cs[i % cs.length] : undefined
        };
      });
    },
    n_a: function n_a(len) {
      return Array(len).fill({
        value: 'n/a'
      });
    },
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    }
  }
});
;// ./src/components/TitleLegend.vue?vue&type=script&lang=js
 /* harmony default export */ const components_TitleLegendvue_type_script_lang_js = (TitleLegendvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TitleLegend.vue?vue&type=style&index=0&id=7fdc78e5&prod&lang=css
var TitleLegendvue_type_style_index_0_id_7fdc78e5_prod_lang_css = __webpack_require__(463);
;// ./src/components/TitleLegend.vue?vue&type=style&index=0&id=7fdc78e5&prod&lang=css

;// ./src/components/TitleLegend.vue



;


/* normalize component */

var TitleLegend_component = normalizeComponent(
  components_TitleLegendvue_type_script_lang_js,
  TitleLegendvue_type_template_id_7fdc78e5_render,
  TitleLegendvue_type_template_id_7fdc78e5_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const TitleLegend = (TitleLegend_component.exports);
;// ./src/mixins/shaders.js
function shaders_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = shaders_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function shaders_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return shaders_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? shaders_arrayLikeToArray(r, a) : void 0; } }
function shaders_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Parser for shader events

/* harmony default export */ const shaders = ({
  methods: {
    // Init shaders from extensions
    init_shaders: function init_shaders(skin, prev) {
      if (skin !== prev) {
        if (prev) this.shaders = this.shaders.filter(function (x) {
          return x.owner !== prev.id;
        });
        var _iterator = shaders_createForOfIteratorHelper(skin.shaders),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var Shader = _step.value;
            var shader = new Shader();
            shader.owner = skin.id;
            this.shaders.push(shader);
          }
          // TODO: Sort by zIndex
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    },
    on_shader_event: function on_shader_event(d, target) {
      if (d.event === 'new-shader') {
        if (d.args[0].target === target) {
          d.args[0].id = "".concat(d.args[1], "-").concat(d.args[2]);
          this.shaders.push(d.args[0]);
          this.rerender++;
        }
      }
      if (d.event === 'remove-shaders') {
        var id = d.args.join('-');
        this.shaders = this.shaders.filter(function (x) {
          return x.id !== id;
        });
      }
    }
  },
  watch: {
    skin: function skin(n, p) {
      this.init_shaders(n, p);
    }
  },
  data: function data() {
    return {
      shaders: []
    };
  }
});
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=script&lang=js






/* harmony default export */ const Sectionvue_type_script_lang_js = ({
  name: "GridSection",
  components: {
    Grid: components_Grid,
    Sidebar: components_Sidebar,
    ChartLegend: Legend,
    TitleChartLegend: TitleLegend
  },
  mixins: [shaders],
  props: ["common", "grid_id", 'enableSideBarBoxValue', "enableZoom", "decimalPlace", "priceLine", "enableCrosshair", "applyShaders", "ignore_OHLC", "legendDecimal", "tv_id", "showTitleChartLegend", "isOverlayCollapsed", "collpaseButton"],
  data: function data() {
    return {
      meta_props: {},
      rerender: 0,
      last_ghash: ""
    };
  },
  computed: {
    // Component-specific props subsets:
    grid_props: function grid_props() {
      var _this = this;
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);

      // Split offchart data between offchart grids

      if (id > 0) {
        var _p$data;
        //console.log("grid.settings",id)
        var all = p.data;
        // p.data = [p.data[id - 1]]
        p.data = [p.data.filter(function (d) {
          return !_this.hasGridId(d);
        })[id - 1]];
        // Merge offchart overlays with custom ids with
        // the existing onse (by comparing the grid ids)
        (_p$data = p.data).push.apply(_p$data, _toConsumableArray(all.filter(function (x) {
          return x.grid && x.grid.id === id;
        })));
      }
      p.width = p.layout.grids[id].width;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.grid_shaders;
      return p;
    },
    sidebar_props: function sidebar_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].sb;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.sb_shaders;
      return p;
    },
    section_values: function section_values() {
      var id = this.$props.grid_id;
      // console.log("section_values")
      var p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].width;
      return p.cursor.values[id];
    },
    legend_props: function legend_props() {
      var _this2 = this;
      //console.log("legend_props")
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);

      // Split offchart data between offchart grids
      if (id > 0) {
        var _p$data2;
        var all = p.data;
        p.offchart = all;
        // p.data = [p.data[id - 1]];
        // Legend Props Update here 
        p.data = [p.data.filter(function (d) {
          return !_this2.hasGridId(d);
        })[id - 1]];
        (_p$data2 = p.data).push.apply(_p$data2, _toConsumableArray(all.filter(function (x) {
          return x.grid && x.grid.id === id;
        })));
      } else {
        var res = [];
        var showLegendPropsData = [];
        var legendTxtConfig = localStorage.getItem('legendTxtConfig');
        var showLegendProps = localStorage.getItem('showLegendProps');
        // console.log('legendTxtConfig',legendTxtConfig)
        if (this.$props.ignore_OHLC && legendTxtConfig) {
          res = JSON.parse(legendTxtConfig);
          //console.log('parse response ',res)
        }
        if (showLegendProps) {
          showLegendPropsData = JSON.parse(showLegendProps);
          if (Array.isArray(showLegendPropsData) && showLegendPropsData.length > 0) {
            p.showLegendPropsData = showLegendPropsData;
          }
        }
        var mainData = p.data.find(function (d) {
          return d.main;
        });
        var chartType = mainData.type ? mainData.type : "";
        var show_CustomProps = this.$props.ignore_OHLC.includes(chartType);
        var showSettingsMain = this.$props.common.showSettingsButton.includes(chartType);
        p.legendTxtConfig = res;
        p.chartType = chartType;
        p.show_CustomProps = show_CustomProps;
        p.showSettingsMain = showSettingsMain;
        // console.log(JSON.stringify({a:p.show_CustomProps,b:p.legendTxtConfig,mainType}))
      }
      return p;
    },
    get_meta_props: function get_meta_props() {
      return this.meta_props;
    },
    main_chart_type: function main_chart_type() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      if (id === 0) {
        var rangeParams = this.$props.common.range;
        var mainData = p.data.find(function (d) {
          return d.main;
        });
        var mainType = mainData.type ? mainData.type : "";
        // console.log('this.$props.range',mainType,JSON.stringify(rangeParams))
        return mainType;
      }
      return "";
    },
    grid_shaders: function grid_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === "grid";
      });
    },
    sb_shaders: function sb_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === "sidebar";
      });
    }
  },
  watch: {
    common: {
      handler: function handler(val, old_val) {
        var newhash = this.ghash(val);
        if (newhash !== this.last_ghash) {
          this.rerender++;
        }
        if (val.data.length !== old_val.data.length) {
          // Look at this nasty trick!
          this.rerender++;
        }
        this.last_ghash = newhash;
      },
      deep: true
    }
  },
  mounted: function mounted() {
    this.init_shaders(this.$props.common.skin);
    console.log('common.data', this.meta_props);
  },
  methods: {
    hasGridId: function hasGridId(single) {
      if (single !== null && single !== void 0 && single.grid) {
        var _single$grid;
        if (((_single$grid = single.grid) === null || _single$grid === void 0 ? void 0 : _single$grid.id) > 0) {
          return true;
        }
      }
      return false;
    },
    range_changed: function range_changed(r, manualInteraction) {
      if (manualInteraction === void 0) {
        manualInteraction = false;
      }
      console.log("range_changed", r);
      this.$emit("range-changed", r, manualInteraction);
    },
    cursor_changed: function cursor_changed(c) {
      c.grid_id = this.$props.grid_id;
      this.$emit("cursor-changed", c);
    },
    cursor_locked: function cursor_locked(state) {
      this.$emit("cursor-locked", state);
    },
    sidebar_transform: function sidebar_transform(s) {
      this.$emit("sidebar-transform", s);
    },
    emit_meta_props: function emit_meta_props(d) {
      console.log("layer-meta-props section.vue ", d);
      this.$set(this.meta_props, d.layer_id, d);
      this.$emit("layer-meta-props", d);
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, "sidebar");
      this.$emit("custom-event", d);
    },
    button_click: function button_click(event) {
      this.$emit("legend-button-click", event);
    },
    collapse_button_click: function collapse_button_click(event) {
      this.$emit("on-collapse-change", event);
    },
    register_kb: function register_kb(event) {
      this.$emit("register-kb-listener", event);
    },
    remove_kb: function remove_kb(event) {
      this.$emit("remove-kb-listener", event);
    },
    rezoom_range: function rezoom_range(event) {
      var id = "sb-" + event.grid_id;
      if (this.$refs[id]) {
        this.$refs[id].renderer.rezoom_range(event.z, event.diff1, event.diff2);
      }
    },
    ghash: function ghash(val) {
      // Measures grid heights configuration
      var hs = val.layout.grids.map(function (x) {
        return x.height;
      });
      return hs.reduce(function (a, b) {
        return a + b;
      }, "");
    }
  }
});
;// ./src/components/Section.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Sectionvue_type_script_lang_js = (Sectionvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=style&index=0&id=4a517028&prod&lang=css
var Sectionvue_type_style_index_0_id_4a517028_prod_lang_css = __webpack_require__(280);
;// ./src/components/Section.vue?vue&type=style&index=0&id=4a517028&prod&lang=css

;// ./src/components/Section.vue



;


/* normalize component */

var Section_component = normalizeComponent(
  components_Sectionvue_type_script_lang_js,
  Sectionvue_type_template_id_4a517028_render,
  Sectionvue_type_template_id_4a517028_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Section = (Section_component.exports);
;// ./src/components/js/botbar.js


function botbar_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = botbar_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function botbar_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return botbar_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? botbar_arrayLikeToArray(r, a) : void 0; } }
function botbar_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }


var botbar_MINUTE15 = constants.MINUTE15,
  botbar_MINUTE = constants.MINUTE,
  botbar_HOUR = constants.HOUR,
  botbar_DAY = constants.DAY,
  botbar_WEEK = constants.WEEK,
  botbar_MONTH = constants.MONTH,
  botbar_YEAR = constants.YEAR,
  botbar_MONTHMAP = constants.MONTHMAP;
var Botbar = /*#__PURE__*/function () {
  function Botbar(canvas, comp) {
    classCallCheck_classCallCheck(this, Botbar);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.layout = this.$p.layout;
  }
  return createClass_createClass(Botbar, [{
    key: "update",
    value: function update() {
      this.grid_0 = this.layout.grids[0];
      var width = this.layout.botbar.width;
      var height = this.layout.botbar.height;
      var sb = this.layout.grids[0].sb;

      //this.ctx.fillStyle = this.$p.colors.back
      this.ctx.font = this.$p.font;
      //this.ctx.fillRect(0, 0, width, height)
      this.ctx.clearRect(0, 0, width, height);
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(Math.floor(width + 1), 0.5);
      this.ctx.stroke();
      this.ctx.fillStyle = this.$p.colors.text;
      this.ctx.beginPath();
      var _iterator = botbar_createForOfIteratorHelper(this.layout.botbar.xs),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          var lbl = this.format_date(p);
          if (p[0] > width - sb) continue;
          this.ctx.moveTo(p[0] - 0.5, 0);
          this.ctx.lineTo(p[0] - 0.5, 4.5);
          if (!this.lbl_highlight(p[1][0])) {
            this.ctx.globalAlpha = 0.85;
          }
          this.ctx.textAlign = 'center';
          this.ctx.fillText(lbl, p[0], 18);
          this.ctx.globalAlpha = 1;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.ctx.stroke();
      this.apply_shaders();
      if (this.$p.cursor.x && this.$p.cursor.t !== undefined) this.panel();
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.layout.grids[0];
      var props = {
        layout: layout,
        cursor: this.$p.cursor
      };
      var _iterator2 = botbar_createForOfIteratorHelper(this.comp.bot_shaders),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var s = _step2.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "panel",
    value: function panel() {
      var lbl = this.format_cursor_x();
      this.ctx.fillStyle = this.$p.colors.panel;
      var measure = this.ctx.measureText(lbl + '    ');
      var panwidth = Math.floor(measure.width);
      var cursor = this.$p.cursor.x;
      // let x = Math.floor(cursor - panwidth * 0.5)
      var x = Math.floor(cursor);
      // console.log(x,cursor,panwidth)
      var y = -0.5;
      var panheight = this.comp.config.PANHEIGHT;
      this.ctx.fillRect(x, y, panwidth, panheight + 0.5);
      this.ctx.fillStyle = this.$p.colors.textHL;
      // this.ctx.textAlign = 'center'
      // this.ctx.fillText(lbl, cursor, y + 16)
      this.ctx.textAlign = 'left';
      this.ctx.fillText(lbl, cursor + 4, y + 16);
    }
  }, {
    key: "format_date",
    value: function format_date(p) {
      var t = p[1][0];
      t = this.grid_0.ti_map.i2t(t);
      var ti = this.$p.layout.grids[0].ti_map.tf;
      // Enable timezones only for tf < 1D
      var k = ti < botbar_DAY ? 1 : 0;
      var tZ = t + k * this.$p.timezone * botbar_HOUR;

      //t += new Date(t).getTimezoneOffset() * MINUTE
      var d = new Date(tZ);
      if (p[2] === botbar_YEAR || utils.year_start(t) === t) {
        return d.getUTCFullYear();
      }
      if (p[2] === botbar_MONTH || utils.month_start(t) === t) {
        return botbar_MONTHMAP[d.getUTCMonth()];
      }
      // TODO(*) see grid_maker.js
      if (utils.day_start(tZ) === tZ) return d.getUTCDate();
      var h = utils.add_zero(d.getUTCHours());
      var m = utils.add_zero(d.getUTCMinutes());
      return h + ':' + m;
    }
  }, {
    key: "format_cursor_x",
    value: function format_cursor_x() {
      var t = this.$p.cursor.t;
      t = this.grid_0.ti_map.i2t(t);
      //let ti = this.$p.interval
      var ti = this.$p.layout.grids[0].ti_map.tf;
      // Enable timezones only for tf < 1D
      var k = ti < botbar_DAY ? 1 : 0;

      //t += new Date(t).getTimezoneOffset() * MINUTE
      var d = new Date(t + k * this.$p.timezone * botbar_HOUR);
      if (ti === botbar_YEAR) {
        return d.getUTCFullYear();
      }
      if (ti < botbar_YEAR) {
        var yr = '`' + "".concat(d.getUTCFullYear()).slice(-2);
        var mo = botbar_MONTHMAP[d.getUTCMonth()];
        var dd = '01';
      }
      if (ti <= botbar_WEEK) dd = d.getUTCDate();
      var date = "".concat(dd, " ").concat(mo, " ").concat(yr);
      var time = '';
      if (ti < botbar_DAY) {
        var h = utils.add_zero(d.getUTCHours());
        var m = utils.add_zero(d.getUTCMinutes());
        time = h + ':' + m;
      }
      return "".concat(date, "  ").concat(time);
    }

    // Highlights the begining of a time interval
    // TODO: improve. Problem: let's say we have a new month,
    // but if there is no grid line in place, there
    // will be no month name on t-axis. Sad.
    // Solution: manipulate the grid, skew it, you know
  }, {
    key: "lbl_highlight",
    value: function lbl_highlight(t) {
      var ti = this.$p.interval;
      if (t === 0) return true;
      if (utils.month_start(t) === t) return true;
      if (utils.day_start(t) === t) return true;
      if (ti <= botbar_MINUTE15 && t % botbar_HOUR === 0) return true;
      return false;
    }
  }, {
    key: "mousemove",
    value: function mousemove() {}
  }, {
    key: "mouseout",
    value: function mouseout() {}
  }, {
    key: "mouseup",
    value: function mouseup() {}
  }, {
    key: "mousedown",
    value: function mousedown() {}
  }]);
}();

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=script&lang=js
// The bottom bar (yep, that thing with a bunch of dates)



/* harmony default export */ const Botbarvue_type_script_lang_js = ({
  name: 'Botbar',
  mixins: [canvas],
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'rerender', 'tv_id', 'config', 'shaders', 'timezone'],
  computed: {
    bot_shaders: function bot_shaders() {
      return this.$props.shaders.filter(function (x) {
        return x.target === 'botbar';
      });
    }
  },
  watch: {
    range: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    rerender: function rerender() {
      var _this = this;
      this.$nextTick(function () {
        return _this.redraw();
      });
    }
  },
  mounted: function mounted() {
    var el = this.$refs['canvas'];
    this.renderer = new Botbar(el, this);
    this.setup();
    this.redraw();
  },
  render: function render(h) {
    var sett = this.$props.layout.botbar;
    return this.create_canvas(h, 'botbar', {
      position: {
        x: 0,
        y: sett.offset || 0
      },
      attrs: {
        rerender: this.$props.rerender,
        width: sett.width,
        height: sett.height
      },
      style: {
        backgroundColor: this.$props.colors.back
      }
    });
  }
});
;// ./src/components/Botbar.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Botbarvue_type_script_lang_js = (Botbarvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=style&index=0&id=1cb09285&prod&lang=css
var Botbarvue_type_style_index_0_id_1cb09285_prod_lang_css = __webpack_require__(531);
;// ./src/components/Botbar.vue?vue&type=style&index=0&id=1cb09285&prod&lang=css

;// ./src/components/Botbar.vue
var Botbar_render, Botbar_staticRenderFns
;

;


/* normalize component */

var Botbar_component = normalizeComponent(
  components_Botbarvue_type_script_lang_js,
  Botbar_render,
  Botbar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Botbar = (Botbar_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Keyboard.vue?vue&type=script&lang=js
/* harmony default export */ const Keyboardvue_type_script_lang_js = ({
  name: 'Keyboard',
  created: function created() {
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);
    window.addEventListener('keypress', this.keypress);
    this._listeners = {};
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('keyup', this.keyup);
    window.removeEventListener('keypress', this.keypress);
  },
  methods: {
    keydown: function keydown(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keydown) {
          l.keydown(event);
        } else {
          console.warn("No 'keydown' listener for ".concat(id));
        }
      }
    },
    keyup: function keyup(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keyup) {
          l.keyup(event);
        } else {
          console.warn("No 'keyup' listener for ".concat(id));
        }
      }
    },
    keypress: function keypress(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keypress) {
          l.keypress(event);
        } else {
          console.warn("No 'keypress' listener for ".concat(id));
        }
      }
    },
    register: function register(listener) {
      this._listeners[listener.id] = listener;
    },
    remove: function remove(listener) {
      delete this._listeners[listener.id];
    }
  },
  render: function render(h) {
    return h();
  }
});
;// ./src/components/Keyboard.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Keyboardvue_type_script_lang_js = (Keyboardvue_type_script_lang_js); 
;// ./src/components/Keyboard.vue
var Keyboard_render, Keyboard_staticRenderFns
;



/* normalize component */
;
var Keyboard_component = normalizeComponent(
  components_Keyboardvue_type_script_lang_js,
  Keyboard_render,
  Keyboard_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Keyboard = (Keyboard_component.exports);
;// ./src/mixins/datatrack.js
// Data tracker/watcher


/* harmony default export */ const datatrack = ({
  methods: {
    data_changed: function data_changed() {
      var n = this.ohlcv;
      var changed = false;
      if (this._data_n0 !== n[0] && this._data_len !== n.length) {
        changed = true;
      }
      this.check_all_data(changed);
      if (this.ti_map.ib) {
        this.reindex_delta(n[0], this._data_n0);
      }
      this._data_n0 = n[0];
      this._data_len = n.length;
      this.save_data_t();
      return changed;
    },
    check_all_data: function check_all_data(changed) {
      // If length of data in the Structure changed by > 1 point
      // emit a special event for DC to recalc the scripts
      // TODO: check overlays data too
      var len = this._data_len || 0;
      if (Math.abs(this.ohlcv.length - len) > 1 || this._data_n0 !== this.ohlcv[0]) {
        this.$emit('custom-event', {
          event: 'data-len-changed',
          args: []
        });
      }
    },
    reindex_delta: function reindex_delta(n, p) {
      n = n || [[0]];
      p = p || [[0]];
      var dt = n[0] - p[0];
      if (dt !== 0 && this._data_t) {
        // Convert t back to index
        try {
          // More precise method first
          var nt = this._data_t + 0.01; // fix for the filter lib
          var res = utils.fast_nearest(this.ohlcv, nt);
          var cndl = this.ohlcv[res[0]];
          var off = (nt - cndl[0]) / this.interval_ms;
          this["goto"](res[0] + off);
        } catch (e) {
          this["goto"](this.ti_map.t2i(this._data_t));
        }
      }
    },
    save_data_t: function save_data_t() {
      this._data_t = this.ti_map.i2t(this.range[1]); // save as t
    }
  },
  data: function data() {
    return {
      _data_n0: null,
      _data_len: 0,
      _data_t: 0
    };
  }
});
;// ./src/components/js/ti_mapping.js




// Time-index mapping (for non-linear t-axis)


var MAX_ARR = Math.pow(2, 32);

// 3 MODES of index calculation for overlays/subcharts:
// ::: indexSrc :::
// * "map"      -> use TI mapping functions to detect index
//                 (slowest, for stocks only. DEFAULT)
//
// * "calc"     -> calculate shift between sub & data
//                 (faster, but overlay data should be perfectly
//                  align with the main chart,
//                  1-1 candle/data point. Supports Renko)
//
// * "data"     -> overlay data should come with candle index
//                 (fastest, supports Renko)
var TI = /*#__PURE__*/function () {
  function TI() {
    classCallCheck_classCallCheck(this, TI);
    this.ib = false;
  }
  return createClass_createClass(TI, [{
    key: "init",
    value: function init(params, res) {
      var sub = params.sub,
        interval = params.interval,
        meta = params.meta,
        $p = params.$props,
        interval_ms = params.interval_ms,
        sub_start = params.sub_start,
        ib = params.ib;
      this.ti_map = [];
      this.it_map = [];
      this.sub_i = [];
      this.ib = ib;
      this.sub = res;
      this.ss = sub_start;
      this.tf = interval_ms;
      var start = meta.sub_start;

      // Skip mapping for the regular mode
      if (this.ib) {
        this.map_sub(res);
      }
    }

    // Make maps for the main subset
  }, {
    key: "map_sub",
    value: function map_sub(res) {
      for (var i = 0; i < res.length; i++) {
        var t = res[i][0];
        var _i = this.ss + i;
        this.ti_map[t] = _i;
        this.it_map[_i] = t;

        // Overwrite t with i
        var copy = _toConsumableArray(res[i]);
        copy[0] = _i;
        this.sub_i.push(copy);
      }
    }

    // Map overlay data
    // TODO: parse() called 3 times instead of 2 for 'spx_sample.json'
  }, {
    key: "parse",
    value: function parse(data, mode) {
      if (!this.ib || !this.sub[0] || mode === 'data') return data;
      var res = [];
      var k = 0; // Candlestick index

      if (mode === 'calc') {
        var shift = utils.index_shift(this.sub, data);
        for (var i = 0; i < data.length; i++) {
          var _i = this.ss + i;
          var copy = _toConsumableArray(data[i]);
          copy[0] = _i + shift;
          res.push(copy);
        }
        return res;
      }

      // If indicator data starts after ohlcv, calc the first index
      if (data.length) {
        try {
          var k1 = utils.fast_nearest(this.sub, data[0][0])[0];
          if (k1 !== null && k1 >= 0) k = k1;
        } catch (e) {}
      }
      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0];
      for (var i = 0; i < data.length; i++) {
        var _copy = _toConsumableArray(data[i]);
        var tk = this.sub[k][0];
        var t = data[i][0];
        var index = this.ti_map[t];
        if (index === undefined) {
          // Linear extrapolation
          if (t < t0 || t > tN) {
            index = this.ss + k - (tk - t) / this.tf;
            t = data[i + 1] ? data[i + 1][0] : undefined;
          }

          // Linear interpolation
          else {
            var tk2 = this.sub[k + 1][0];
            index = tk === tk2 ? this.ss + k : this.ss + k + (t - tk) / (tk2 - tk);
            t = data[i + 1] ? data[i + 1][0] : undefined;
          }
        }
        // Race of data points & sub points (ohlcv)
        // (like turn based increments)
        while (k + 1 < this.sub.length - 1 && t > this.sub[k + 1][0]) {
          k++;
          tk = this.sub[k][0];
        }
        _copy[0] = index;
        res.push(_copy);
      }
      return res;
    }

    // index => time
  }, {
    key: "i2t",
    value: function i2t(i) {
      if (!this.ib || !this.sub.length) return i; // Regular mode

      // Discrete mapping
      var res = this.it_map[i];
      if (res !== undefined) return res;
      // Linear extrapolation
      else if (i >= this.ss + this.sub_i.length) {
        var di = i - (this.ss + this.sub_i.length) + 1;
        var last = this.sub[this.sub.length - 1];
        return last[0] + di * this.tf;
      } else if (i < this.ss) {
        var _di = i - this.ss;
        return this.sub[0][0] + _di * this.tf;
      }

      // Linear Interpolation
      var i1 = Math.floor(i) - this.ss;
      var i2 = i1 + 1;
      var len = this.sub.length;
      if (i2 >= len) i2 = len - 1;
      var sub1 = this.sub[i1];
      var sub2 = this.sub[i2];
      if (sub1 && sub2) {
        var t1 = sub1[0];
        var t2 = sub2[0];
        return t1 + (t2 - t1) * (i - i1 - this.ss);
      }
      return undefined;
    }

    // Map or bypass depending on the mode
  }, {
    key: "i2t_mode",
    value: function i2t_mode(i, mode) {
      return mode === 'data' ? i : this.i2t(i);
    }

    // time => index
    // TODO: when switch from IB mode to regular tools
    // disappear (bc there is no more mapping)
  }, {
    key: "t2i",
    value: function t2i(t) {
      if (!this.sub.length) return undefined;

      // Discrete mapping
      var res = this.ti_map[t];
      console.log("t2i Discrete mapping", res);
      if (res !== undefined) return res;
      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0];
      console.log("t2i value", {
        t0: t0,
        tN: tN
      });
      // Linear extrapolation
      if (t < t0) {
        console.log("t2i fall into first if");
        return this.ss - (t0 - t) / this.tf;
      } else if (t > tN) {
        console.log("t2i fall into else if");
        var k = this.sub.length - 1;
        return this.ss + k - (tN - t) / this.tf;
      }
      try {
        // Linear Interpolation
        console.log("t2i fall into fastest nearest ");
        var i = utils.fast_nearest(this.sub, t);
        var tk = this.sub[i[0]][0];
        var tk2 = this.sub[i[1]][0];
        var _k = (t - tk) / (tk2 - tk);
        return this.ss + i[0] + _k * (i[1] - i[0]);
      } catch (e) {}
      return undefined;
    }

    // Auto detect: is it time or index?
    // Assuming that index-based mode is ON
  }, {
    key: "smth2i",
    value: function smth2i(smth) {
      if (smth > MAX_ARR) {
        return this.t2i(smth); // it was time
      } else {
        return smth; // it was an index
      }
    }
  }, {
    key: "smth2t",
    value: function smth2t(smth) {
      if (smth < MAX_ARR) {
        return this.i2t(smth); // it was an index
      } else {
        return smth; // it was time
      }
    }

    // Global Time => Index (uses all data, approx. method)
    // Used by tv.goto()
  }, {
    key: "gt2i",
    value: function gt2i(smth, ohlcv) {
      if (smth > MAX_ARR) {
        var E = 0.1; // Fixes the arrayslicer bug
        var _Utils$fast_nearest = utils.fast_nearest(ohlcv, smth + E),
          _Utils$fast_nearest2 = _slicedToArray(_Utils$fast_nearest, 2),
          i1 = _Utils$fast_nearest2[0],
          i2 = _Utils$fast_nearest2[1];
        if (typeof i1 === 'number') {
          return i1;
        } else {
          return this.t2i(smth); // fallback
        }
      } else {
        return smth; // it was an index
      }
    }
  }]);
}();

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=script&lang=js













/* harmony default export */ const Chartvue_type_script_lang_js = ({
  name: 'Chart',
  components: {
    GridSection: Section,
    Botbar: components_Botbar,
    Keyboard: Keyboard
  },
  mixins: [shaders, datatrack],
  props: ['title_txt', 'data', 'width', 'height', 'font', 'colors', 'overlays', 'tv_id', 'config', 'buttons', 'toolbar', 'ib', 'applyShaders', 'skin', 'timezone', 'enableZoom', 'enableSideBarBoxValue', 'decimalPlace', 'ignore_OHLC', 'priceLine', 'ignoreNegativeIndex', 'enableCrosshair', 'legendDecimal', 'showSettingsButton', 'showTitleChartLegend', 'isOverlayCollapsed', 'collpaseButton'],
  data: function data() {
    return {
      // Current data slice
      sub: [],
      // Time range
      range: [],
      initRange: [],
      // Candlestick interval
      interval: 0,
      // Crosshair states
      cursor: {
        x: null,
        y: null,
        t: null,
        y$: null,
        grid_id: null,
        locked: false,
        values: {},
        scroll_lock: false,
        mode: utils.xmode()
      },
      // A trick to re-render botbar
      rerender: 0,
      // Layers meta-props (changing behaviour)
      layers_meta: {},
      // Y-transforms (for y-zoom and -shift)
      y_transforms: {},
      // Default OHLCV settings (when using DataStructure v1.0)
      settings_ohlcv: {},
      // Default overlay settings
      settings_ov: {},
      // Meta data
      last_candle: [],
      last_values: {},
      sub_start: undefined,
      activated: false,
      legendTxtConfig: undefined
    };
  },
  computed: {
    // Component-specific props subsets:
    main_section: function main_section() {
      var p = Object.assign({}, this.common_props());
      p.data = this.overlay_subset(this.onchart, 'onchart');
      p.data.push({
        type: this.chart.type || 'Candles',
        main: true,
        data: this.sub,
        i0: this.sub_start,
        settings: this.chart.settings || this.settings_ohlcv,
        grid: this.chart.grid || {},
        last: this.last_candle
      });
      p.overlays = this.$props.overlays;
      p.showSettingsButton = this.$props.showSettingsButton;
      return p;
    },
    sub_section: function sub_section() {
      var p = Object.assign({}, this.common_props());
      p.data = this.overlay_subset(this.offchart, 'offchart');
      p.overlays = this.$props.overlays;
      return p;
    },
    botbar_props: function botbar_props() {
      var p = Object.assign({}, this.common_props());
      p.width = p.layout.botbar.width;
      p.height = p.layout.botbar.height;
      p.rerender = this.rerender;
      return p;
    },
    offsub: function offsub() {
      return this.overlay_subset(this.offchart, 'offchart');
    },
    // Datasets: candles, onchart, offchart indicators
    ohlcv: function ohlcv() {
      return this.$props.data.ohlcv || this.chart.data || [];
    },
    chart: function chart() {
      return this.$props.data.chart || {
        grid: {}
      };
    },
    onchart: function onchart() {
      return this.$props.data.onchart || [];
    },
    offchart: function offchart() {
      return this.$props.data.offchart || [];
    },
    filter: function filter() {
      return this.$props.ib ? utils.fast_filter_i : utils.fast_filter;
    },
    styles: function styles() {
      var w = this.$props.toolbar ? this.$props.config.TOOLBAR : 0;
      return {
        'margin-left': "".concat(w, "px")
      };
    },
    meta: function meta() {
      return {
        last: this.last_candle,
        sub_start: this.sub_start,
        activated: this.activated
      };
    },
    forced_tf: function forced_tf() {
      return this.chart.tf;
    },
    forced_initRange: function forced_initRange() {
      return this.initRange.length > 0 ? this.initRange : null;
    },
    auto_y_axis: function auto_y_axis() {
      var gridKeys = Object.keys(this.y_transforms);
      console.log("gridKeys", gridKeys);
      if (gridKeys.length > 0 && gridKeys.includes("0")) {
        return this.y_transforms['0'].auto;
      }
      return true;
    }
  },
  watch: {
    width: function width() {
      this.update_layout();
      if (this._hook_resize) this.ce('?chart-resize');
    },
    height: function height() {
      this.update_layout();
      if (this._hook_resize) this.ce('?chart-resize');
    },
    ib: function ib(nw) {
      if (!nw) {
        // Change range index => time
        var t1 = this.ti_map.i2t(this.range[0]);
        var t2 = this.ti_map.i2t(this.range[1]);
        utils.overwrite(this.range, [t1, t2]);
        this.interval = this.interval_ms;
      } else {
        this.init_range(); // TODO: calc index range instead
        utils.overwrite(this.range, this.range);
        this.interval = 1;
      }
      var sub = this.subset(this.range, 'subset ib watch');
      utils.overwrite(this.sub, sub);
      this.update_layout();
    },
    timezone: function timezone() {
      this.update_layout();
    },
    colors: function colors() {
      utils.overwrite(this.range, this.range);
    },
    forced_tf: function forced_tf(n, p) {
      this.update_layout(true);
      this.ce('exec-all-scripts');
    },
    data: {
      handler: function handler(n, p) {
        var _this = this;
        if (!this.sub.length) this.init_range();
        var sub = this.subset(this.range, 'subset dataset');
        // Fixes Infinite loop warn, when the subset is empty
        // TODO: Consider removing 'sub' from data entirely
        if (this.sub.length || sub.length) {
          utils.overwrite(this.sub, sub);
        }
        var nw = this.data_changed();
        this.update_layout(nw);
        utils.overwrite(this.range, this.range);
        this.cursor.scroll_lock = !!n.scrollLock;
        if (n.scrollLock && this.cursor.locked) {
          this.cursor.locked = false;
        }
        if (this._hook_data) this.ce('?chart-data', nw);
        this.update_last_values();
        // TODO: update legend values for overalys
        this.rerender++;
        var findMain = this.main_section.data.find(function (d) {
          return d.main;
        });
        // this
        //   this.$emit('custom-event', {})
        //   console.log('this.rerender',findMain,this.sub.length)
        setTimeout(function () {
          _this.$emit("chart_data_changed", nw);
        });
      },
      deep: true
    }
  },
  created: function created() {
    // Context for text measurements
    this.ctx = new context(this.$props);

    // Initial layout (All measurments for the chart)
    this.init_range();
    this.sub = this.subset(this.range, 'subset created');
    utils.overwrite(this.range, this.range); // Fix for IB mode
    this._layout = new layout(this);

    // Updates current cursor values
    this.updater = new updater(this);
    this.update_last_values();
    this.init_shaders(this.skin);
  },
  methods: {
    range_changed: function range_changed(r, manualInteraction) {
      if (manualInteraction === void 0) {
        manualInteraction = false;
      }
      // Overwite & keep the original references
      // Quick fix for IB mode (switch 2 next lines)
      // TODO: wtf?
      var sub = this.subset(r, 'subset range changed');
      utils.overwrite(this.initRange, r);
      if (manualInteraction) {}
      // console.log('this.range before update',this.range)
      utils.overwrite(this.range, r);
      utils.overwrite(this.sub, sub);
      this.update_layout();
      // console.log('this.range after update',this.sub.length,r,this.range)
      // console.log('range_changes_working',this.ignoreNegativeIndex)
      if (this.ignoreNegativeIndex) {
        // let r2 = this.ti_map.t2i(r[0])
        this.$emit('range-changed', r, manualInteraction);
      } else {
        this.$emit('range-changed', r, manualInteraction);
      }
      if (this.$props.ib) this.save_data_t();

      // console.log('this.ti_map.t2i(r[0])',this.ti_map.t2i(r[0]))
    },
    range_changed_by_time: function range_changed_by_time(startTime, endTime) {
      // Find Index For Start 
      var dataChanged = this.data_changed();
      console.log("range_changed_by_time dataChanged", dataChanged);
      var startTimeIndex = this.ti_map.t2i(startTime);
      var endTimeIndex = this.ti_map.t2i(endTime);
      console.log("range_changed_by_time updatedIndex", {
        dataChanged: dataChanged,
        startTimeIndex: startTimeIndex,
        endTimeIndex: endTimeIndex
      });
      var newRange = [startTimeIndex, endTimeIndex];
      this.range_changed(newRange);
      // console.log('this.ti_map.t2i(r[0])',this.ti_map.t2i(r[0]))
    },
    "goto": function goto(t) {
      var dt = this.range[1] - this.range[0];
      this.range_changed([t - dt, t]);
    },
    setRange: function setRange(t1, t2) {
      this.range_changed([t1, t2]);
    },
    cursor_changed: function cursor_changed(e) {
      if (e.mode) this.cursor.mode = e.mode;
      if (this.cursor.mode !== 'explore') {
        this.updater.sync(e);
      }
      if (this._hook_xchanged) this.ce('?x-changed', e);
    },
    cursor_locked: function cursor_locked(state) {
      if (this.cursor.scroll_lock && state) return;
      this.cursor.locked = state;
      if (this._hook_xlocked) this.ce('?x-locked', state);
    },
    calc_interval: function calc_interval(caller) {
      var _this2 = this;
      var tf = utils.parse_tf(this.forced_tf);
      if (this.ohlcv.length < 2 && !tf) return;
      this.interval_ms = tf || utils.detect_interval(this.ohlcv);
      this.interval = this.$props.ib ? 1 : this.interval_ms;
      console.log("calc_interval", {
        interval: this.interval,
        interval_ms: this.interval_ms,
        forced_tf: this.forced_tf,
        caller: caller
      });
      utils.warn(function () {
        return _this2.$props.ib && !_this2.chart.tf;
      }, constants.IB_TF_WARN, constants.SECOND);
    },
    set_ytransform: function set_ytransform(s) {
      var obj = this.y_transforms[s.grid_id] || {};
      Object.assign(obj, s);
      this.$set(this.y_transforms, s.grid_id, obj);
      this.update_layout();
      utils.overwrite(this.range, this.range);
      if (s.grid_id === 0) {
        this.$emit('sidebar-transform', this.y_transforms['0']);
      }
    },
    default_range: function default_range() {
      var dl = this.$props.config.DEFAULT_LEN;
      var ml = this.$props.config.MINIMUM_LEN + 0.5;
      var l = this.ohlcv.length - 1;
      if (this.ohlcv.length < 2) return;
      if (this.ohlcv.length <= dl) {
        var s = 0,
          d = ml;
      } else {
        s = l - dl, d = 0.5;
      }
      if (!this.$props.ib) {
        utils.overwrite(this.range, [this.ohlcv[s][0] - this.interval * d, this.ohlcv[l][0] + this.interval * ml]);
      } else {
        var _this$chart3;
        var newArr = [s - this.interval * d, l + this.interval * ml];
        console.log("this.forced_initRange", this.forced_initRange);
        if (this.forced_initRange) {
          newArr = this.forced_initRange;
        } else {
          var _this$chart, _this$chart2;
          if ((_this$chart = this.chart) !== null && _this$chart !== void 0 && _this$chart.initRange && ((_this$chart2 = this.chart) === null || _this$chart2 === void 0 || (_this$chart2 = _this$chart2.initRange) === null || _this$chart2 === void 0 ? void 0 : _this$chart2.length) == 2) {
            newArr = this.chart.initRange;
          }
        }
        console.log("searchResults Library Data", newArr, (_this$chart3 = this.chart) === null || _this$chart3 === void 0 ? void 0 : _this$chart3.initRange, this.forced_initRange);
        utils.overwrite(this.range, newArr);
      }
    },
    subset: function subset(range, type) {
      if (range === void 0) {
        range = this.range;
      }
      var _this$filter = this.filter(this.ohlcv, range[0] - this.interval, range[1]),
        _this$filter2 = _slicedToArray(_this$filter, 2),
        res = _this$filter2[0],
        index = _this$filter2[1];
      this.ti_map = new TI();
      if (res) {
        this.sub_start = index;
        this.ti_map.init(this, res);
        if (!this.$props.ib) return res || [];
        // console.log("subset "+type,{
        //   range,index,res,sub_i:this.ti_map.sub_i
        // })
        return this.ti_map.sub_i;
      }
      return [];
    },
    common_props: function common_props() {
      return {
        title_txt: this.chart.name || this.$props.title_txt,
        layout: this._layout,
        sub: this.sub,
        range: this.range,
        interval: this.interval,
        cursor: this.cursor,
        colors: this.$props.colors,
        font: this.$props.font,
        y_ts: this.y_transforms,
        tv_id: this.$props.tv_id,
        config: this.$props.config,
        buttons: this.$props.buttons,
        meta: this.meta,
        skin: this.$props.skin,
        noidea: true
      };
    },
    overlay_subset: function overlay_subset(source, side) {
      var _this3 = this;
      return source.map(function (d, i) {
        var res = utils.fast_filter(d.data, _this3.ti_map.i2t_mode(_this3.range[0] - _this3.interval, d.indexSrc), _this3.ti_map.i2t_mode(_this3.range[1], d.indexSrc));
        return {
          type: d.type,
          name: utils.format_name(d),
          data: _this3.ti_map.parse(res[0] || [], d.indexSrc || 'map'),
          settings: d.settings || _this3.settings_ov,
          grid: d.grid || {},
          tf: utils.parse_tf(d.tf),
          i0: res[1],
          loading: d.loading,
          some: 1,
          last: (_this3.last_values[side] || [])[i]
        };
      });
    },
    section_props: function section_props(i) {
      return i === 0 ? this.main_section : this.sub_section;
    },
    init_range: function init_range() {
      this.calc_interval('init_range');
      this.default_range();
    },
    layer_meta_props: function layer_meta_props(d) {
      // TODO: check reactivity when layout is changed
      if (!(d.grid_id in this.layers_meta)) {
        this.$set(this.layers_meta, d.grid_id, {});
      }
      this.$set(this.layers_meta[d.grid_id], d.layer_id, d);

      // Rerender
      this.update_layout();
    },
    remove_meta_props: function remove_meta_props(grid_id, layer_id) {
      if (grid_id in this.layers_meta) {
        this.$delete(this.layers_meta[grid_id], layer_id);
      }
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, 'botbar');
      // console.log('emit_custom_event',d)
      this.$emit('custom-event', d);
      if (d.event === 'remove-layer-meta') {
        this.remove_meta_props.apply(this, _toConsumableArray(d.args));
      }
    },
    update_layout: function update_layout(clac_tf) {
      if (clac_tf) this.calc_interval('update_layout');
      var lay = new layout(this);
      utils.copy_layout(this._layout, lay);
      if (this._hook_update) this.ce('?chart-update', lay);
    },
    legend_button_click: function legend_button_click(event) {
      this.$emit('legend-button-click', event);
    },
    collapse_button_click: function collapse_button_click(event) {
      this.$emit('on-collapse-change', event);
    },
    register_kb: function register_kb(event) {
      if (!this.$refs.keyboard) return;
      this.$refs.keyboard.register(event);
    },
    remove_kb: function remove_kb(event) {
      if (!this.$refs.keyboard) return;
      this.$refs.keyboard.remove(event);
    },
    update_last_values: function update_last_values() {
      var _this4 = this;
      this.last_candle = this.ohlcv ? this.ohlcv[this.ohlcv.length - 1] : undefined;
      this.last_values = {
        onchart: [],
        offchart: []
      };
      this.onchart.forEach(function (x, i) {
        var d = x.data || [];
        _this4.last_values.onchart[i] = d[d.length - 1];
      });
      this.offchart.forEach(function (x, i) {
        var d = x.data || [];
        _this4.last_values.offchart[i] = d[d.length - 1];
      });
    },
    // Hook events for extensions
    ce: function ce(event) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      this.emit_custom_event({
        event: event,
        args: args
      });
    },
    // Set hooks list (called from an extension)
    hooks: function hooks() {
      var _this5 = this;
      for (var _len2 = arguments.length, list = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        list[_key2] = arguments[_key2];
      }
      list.forEach(function (x) {
        return _this5["_hook_".concat(x)] = true;
      });
    },
    toggleSidebarCustomRange: function toggleSidebarCustomRange(vericalRange) {
      this.y_transforms['0'] = {
        grid_id: 0,
        zoom: 1,
        auto: false,
        range: vericalRange,
        drugging: false
      };
      this.update_layout();
      this.$emit('sidebar-transform', this.y_transforms['0']);
      // const lay = new Layout(this)
      // this.ce('?chart-update',lay)
    },
    toggleSideBarYAxis: function toggleSideBarYAxis() {
      var _this$$refs;
      var gridKeys = Object.keys(this.y_transforms);
      var mainSideBar = (_this$$refs = this.$refs) === null || _this$$refs === void 0 ? void 0 : _this$$refs.sec[0].$refs['sb-0'];
      if (gridKeys.length > 0 && gridKeys.includes("0")) {
        var isAuto = this.y_transforms['0'].auto;
        if (isAuto) {
          var _mainSideBar$renderer;
          this.y_transforms['0'].auto = !isAuto;
          if (mainSideBar !== null && mainSideBar !== void 0 && (_mainSideBar$renderer = mainSideBar.renderer) !== null && _mainSideBar$renderer !== void 0 && _mainSideBar$renderer.calc_range_function) {
            var currentRange = mainSideBar.renderer.calc_range_function();
            this.y_transforms['0'].range = currentRange;
          }
        } else {
          this.y_transforms['0'].auto = !isAuto;
        }
        this.update_layout();
        this.$emit('sidebar-transform', this.y_transforms['0']);
        console.log("noideawill", this.y_transforms['0'], gridKeys);
      } else {
        var _mainSideBar$renderer2;
        console.log("mainSideBar", mainSideBar);
        if (mainSideBar !== null && mainSideBar !== void 0 && (_mainSideBar$renderer2 = mainSideBar.renderer) !== null && _mainSideBar$renderer2 !== void 0 && _mainSideBar$renderer2.calc_range_function) {
          var _currentRange = mainSideBar.renderer.calc_range_function();
          this.y_transforms['0'] = {
            grid_id: 0,
            zoom: 1,
            auto: false,
            range: _currentRange,
            drugging: false
          };
          this.update_layout();
        }
        this.$emit('sidebar-transform', this.y_transforms['0']);
      }
    }
  },
  mounted: function mounted() {
    //console.log(this._layout)
  }
});
;// ./src/components/Chart.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Chartvue_type_script_lang_js = (Chartvue_type_script_lang_js); 
;// ./src/components/Chart.vue





/* normalize component */
;
var Chart_component = normalizeComponent(
  components_Chartvue_type_script_lang_js,
  Chartvue_type_template_id_27c57e52_render,
  Chartvue_type_template_id_27c57e52_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Chart = (Chart_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=template&id=320099a6
var Toolbarvue_type_template_id_320099a6_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    key: _vm.tool_count,
    staticClass: "trading-vue-toolbar",
    style: _vm.styles
  }, _vm._l(_vm.groups, function (tool, i) {
    return tool.icon && !tool.hidden ? _c('toolbar-item', {
      key: i,
      attrs: {
        "data": tool,
        "subs": _vm.sub_map,
        "dc": _vm.data,
        "config": _vm.config,
        "colors": _vm.colors,
        "selected": _vm.is_selected(tool)
      },
      on: {
        "item-selected": _vm.selected
      }
    }) : _vm._e();
  }), 1);
};
var Toolbarvue_type_template_id_320099a6_staticRenderFns = [];
Toolbarvue_type_template_id_320099a6_render._withStripped = true;

;// ./src/components/Toolbar.vue?vue&type=template&id=320099a6

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=template&id=5ce1aaa3
var ToolbarItemvue_type_template_id_5ce1aaa3_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    "class": ['trading-vue-tbitem', _vm.selected ? 'selected-item' : ''],
    style: _vm.item_style,
    on: {
      "click": function click($event) {
        return _vm.emit_selected('click');
      },
      "mousedown": _vm.mousedown,
      "touchstart": _vm.mousedown,
      "touchend": function touchend($event) {
        return _vm.emit_selected('touch');
      }
    }
  }, [_c('div', {
    staticClass: "trading-vue-tbicon tvjs-pixelated",
    style: _vm.icon_style
  }), _vm._v(" "), _vm.data.group ? _c('div', {
    staticClass: "trading-vue-tbitem-exp",
    style: _vm.exp_style,
    on: {
      "click": _vm.exp_click,
      "mousedown": _vm.expmousedown,
      "mouseover": _vm.expmouseover,
      "mouseleave": _vm.expmouseleave
    }
  }, [_vm._v("\n        ᐳ\n    ")]) : _vm._e(), _vm._v(" "), _vm.show_exp_list ? _c('item-list', {
    attrs: {
      "config": _vm.config,
      "items": _vm.data.items,
      "colors": _vm.colors,
      "dc": _vm.dc
    },
    on: {
      "close-list": _vm.close_list,
      "item-selected": _vm.emit_selected_sub
    }
  }) : _vm._e()], 1);
};
var ToolbarItemvue_type_template_id_5ce1aaa3_staticRenderFns = [];
ToolbarItemvue_type_template_id_5ce1aaa3_render._withStripped = true;

;// ./src/components/ToolbarItem.vue?vue&type=template&id=5ce1aaa3

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=template&id=75847764
var ItemListvue_type_template_id_75847764_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    staticClass: "tvjs-item-list",
    style: _vm.list_style(),
    on: {
      "mousedown": _vm.thismousedown
    }
  }, _vm._l(_vm.items, function (item) {
    return !item.hidden ? _c('div', {
      "class": _vm.item_class(item),
      style: _vm.item_style(item),
      on: {
        "click": function click(e) {
          return _vm.item_click(e, item);
        }
      }
    }, [_c('div', {
      staticClass: "trading-vue-tbicon tvjs-pixelated",
      style: _vm.icon_style(item)
    }), _vm._v(" "), _c('div', [_vm._v(_vm._s(item.type))])]) : _vm._e();
  }), 0);
};
var ItemListvue_type_template_id_75847764_staticRenderFns = [];
ItemListvue_type_template_id_75847764_render._withStripped = true;

;// ./src/components/ItemList.vue?vue&type=template&id=75847764

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=script&lang=js
/* harmony default export */ const ItemListvue_type_script_lang_js = ({
  name: 'ItemList',
  props: ['config', 'items', 'colors', 'dc'],
  data: function data() {
    return {};
  },
  computed: {},
  mounted: function mounted() {
    window.addEventListener('mousedown', this.onmousedown);
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('mousedown', this.onmousedown);
  },
  methods: {
    list_style: function list_style() {
      var conf = this.$props.config;
      var w = conf.TOOLBAR;
      var brd = this.colors.tbListBorder || this.colors.grid;
      var bstl = "1px solid ".concat(brd);
      return {
        left: "".concat(w, "px"),
        background: this.colors.back,
        borderTop: bstl,
        borderRight: bstl,
        borderBottom: bstl
      };
    },
    item_class: function item_class(item) {
      if (this.dc.tool === item.type) {
        return 'tvjs-item-list-item selected-item';
      }
      return 'tvjs-item-list-item';
    },
    item_style: function item_style(item) {
      var conf = this.$props.config;
      var h = conf.TB_ICON + conf.TB_ITEM_M * 2 + 8;
      var sel = this.dc.tool === item.type;
      return {
        height: "".concat(h, "px"),
        color: sel ? undefined : '#888888'
      };
    },
    icon_style: function icon_style(data) {
      var conf = this.$props.config;
      var br = conf.TB_ICON_BRI;
      var im = conf.TB_ITEM_M;
      return {
        'background-image': "url(".concat(data.icon, ")"),
        'width': '25px',
        'height': '25px',
        'margin': "".concat(im, "px"),
        'filter': "brightness(".concat(br, ")")
      };
    },
    item_click: function item_click(e, item) {
      e.cancelBubble = true;
      this.$emit('item-selected', item);
      this.$emit('close-list');
    },
    onmousedown: function onmousedown() {
      this.$emit('close-list');
    },
    thismousedown: function thismousedown(e) {
      e.stopPropagation();
    }
  }
});
;// ./src/components/ItemList.vue?vue&type=script&lang=js
 /* harmony default export */ const components_ItemListvue_type_script_lang_js = (ItemListvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=style&index=0&id=75847764&prod&lang=css
var ItemListvue_type_style_index_0_id_75847764_prod_lang_css = __webpack_require__(796);
;// ./src/components/ItemList.vue?vue&type=style&index=0&id=75847764&prod&lang=css

;// ./src/components/ItemList.vue



;


/* normalize component */

var ItemList_component = normalizeComponent(
  components_ItemListvue_type_script_lang_js,
  ItemListvue_type_template_id_75847764_render,
  ItemListvue_type_template_id_75847764_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ItemList = (ItemList_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=script&lang=js


/* harmony default export */ const ToolbarItemvue_type_script_lang_js = ({
  name: 'ToolbarItem',
  components: {
    ItemList: ItemList
  },
  props: ['data', 'selected', 'colors', 'tv_id', 'config', 'dc', 'subs'],
  data: function data() {
    return {
      exp_hover: false,
      show_exp_list: false,
      sub_item: null
    };
  },
  computed: {
    item_style: function item_style() {
      if (this.$props.data.type === 'System:Splitter') {
        return this.splitter;
      }
      var conf = this.$props.config;
      var im = conf.TB_ITEM_M;
      var m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im;
      var s = conf.TB_ICON + im * 2;
      var b = this.exp_hover ? 0 : 3;
      return {
        'width': "".concat(s, "px"),
        'height': "".concat(s, "px"),
        'margin': "8px ".concat(m, "px 0px ").concat(m, "px"),
        'border-radius': "3px ".concat(b, "px ").concat(b, "px 3px")
      };
    },
    icon_style: function icon_style() {
      if (this.$props.data.type === 'System:Splitter') {
        return {};
      }
      var conf = this.$props.config;
      var br = conf.TB_ICON_BRI;
      var sz = conf.TB_ICON;
      var im = conf.TB_ITEM_M;
      var ic = this.sub_item ? this.sub_item.icon : this.$props.data.icon;
      return {
        'background-image': "url(".concat(ic, ")"),
        'width': "".concat(sz, "px"),
        'height': "".concat(sz, "px"),
        'margin': "".concat(im, "px"),
        'filter': "brightness(".concat(br, ")")
      };
    },
    exp_style: function exp_style() {
      var conf = this.$props.config;
      var im = conf.TB_ITEM_M;
      var s = conf.TB_ICON * 0.5 + im;
      var p = (conf.TOOLBAR - s * 2) / 4;
      return {
        padding: "".concat(s, "px ").concat(p, "px"),
        transform: this.show_exp_list ? 'scale(-0.6, 1)' : 'scaleX(0.6)'
      };
    },
    splitter: function splitter() {
      var conf = this.$props.config;
      var colors = this.$props.colors;
      var c = colors.grid;
      var im = conf.TB_ITEM_M;
      var m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im;
      var s = conf.TB_ICON + im * 2;
      return {
        'width': "".concat(s, "px"),
        'height': '1px',
        'margin': "8px ".concat(m, "px 8px ").concat(m, "px"),
        'background-color': c
      };
    }
  },
  mounted: function mounted() {
    if (this.data.group) {
      var type = this.subs[this.data.group];
      var item = this.data.items.find(function (x) {
        return x.type === type;
      });
      if (item) this.sub_item = item;
    }
  },
  methods: {
    mousedown: function mousedown(e) {
      var _this = this;
      this.click_start = utils.now();
      this.click_id = setTimeout(function () {
        _this.show_exp_list = true;
      }, this.config.TB_ICON_HOLD);
    },
    expmouseover: function expmouseover() {
      this.exp_hover = true;
    },
    expmouseleave: function expmouseleave() {
      this.exp_hover = false;
    },
    expmousedown: function expmousedown(e) {
      if (this.show_exp_list) e.stopPropagation();
    },
    emit_selected: function emit_selected(src) {
      if (utils.now() - this.click_start > this.config.TB_ICON_HOLD) return;
      clearTimeout(this.click_id);
      //if (Utils.is_mobile && src === 'click') return
      // TODO: double firing
      if (!this.data.group) {
        this.$emit('item-selected', this.data);
      } else {
        var item = this.sub_item || this.data.items[0];
        this.$emit('item-selected', item);
      }
    },
    emit_selected_sub: function emit_selected_sub(item) {
      this.$emit('item-selected', item);
      this.sub_item = item;
    },
    exp_click: function exp_click(e) {
      if (!this.data.group) return;
      e.cancelBubble = true;
      this.show_exp_list = !this.show_exp_list;
    },
    close_list: function close_list() {
      this.show_exp_list = false;
    }
  }
});
;// ./src/components/ToolbarItem.vue?vue&type=script&lang=js
 /* harmony default export */ const components_ToolbarItemvue_type_script_lang_js = (ToolbarItemvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=style&index=0&id=5ce1aaa3&prod&lang=css
var ToolbarItemvue_type_style_index_0_id_5ce1aaa3_prod_lang_css = __webpack_require__(395);
;// ./src/components/ToolbarItem.vue?vue&type=style&index=0&id=5ce1aaa3&prod&lang=css

;// ./src/components/ToolbarItem.vue



;


/* normalize component */

var ToolbarItem_component = normalizeComponent(
  components_ToolbarItemvue_type_script_lang_js,
  ToolbarItemvue_type_template_id_5ce1aaa3_render,
  ToolbarItemvue_type_template_id_5ce1aaa3_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ToolbarItem = (ToolbarItem_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=script&lang=js
function Toolbarvue_type_script_lang_js_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = Toolbarvue_type_script_lang_js_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function Toolbarvue_type_script_lang_js_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return Toolbarvue_type_script_lang_js_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? Toolbarvue_type_script_lang_js_arrayLikeToArray(r, a) : void 0; } }
function Toolbarvue_type_script_lang_js_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }

/* harmony default export */ const Toolbarvue_type_script_lang_js = ({
  name: 'Toolbar',
  components: {
    ToolbarItem: ToolbarItem
  },
  props: ['data', 'height', 'colors', 'tv_id', 'config'],
  data: function data() {
    return {
      tool_count: 0,
      sub_map: {}
    };
  },
  computed: {
    styles: function styles() {
      var colors = this.$props.colors;
      var b = this.$props.config.TB_BORDER;
      var w = this.$props.config.TOOLBAR - b;
      var c = colors.grid;
      var cb = colors.tbBack || colors.back;
      var brd = colors.tbBorder || colors.scale;
      var st = this.$props.config.TB_B_STYLE;
      return {
        'width': "".concat(w, "px"),
        'height': "".concat(this.$props.height - 3, "px"),
        'background-color': cb,
        'border-right': "".concat(b, "px ").concat(st, " ").concat(brd)
      };
    },
    groups: function groups() {
      var arr = [];
      var _iterator = Toolbarvue_type_script_lang_js_createForOfIteratorHelper(this.data.tools || []),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var tool = _step.value;
          if (!tool.group) {
            arr.push(tool);
            continue;
          }
          var g = arr.find(function (x) {
            return x.group === tool.group;
          });
          if (!g) {
            arr.push({
              group: tool.group,
              icon: tool.icon,
              items: [tool]
            });
          } else {
            g.items.push(tool);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return arr;
    }
  },
  watch: {
    data: {
      handler: function handler(n) {
        // For some reason Vue.js doesn't want to
        // update 'tools' automatically when new item
        // is pushed/removed. Yo, Vue, I herd you
        // you want more dirty tricks?
        if (n.tools) this.tool_count = n.tools.length;
      },
      deep: true
    }
  },
  mounted: function mounted() {},
  methods: {
    selected: function selected(tool) {
      this.$emit('custom-event', {
        event: 'tool-selected',
        args: [tool.type]
      });
      if (tool.group) {
        // TODO: emit the sub map to DC (save)
        this.sub_map[tool.group] = tool.type;
      }
    },
    is_selected: function is_selected(tool) {
      var _this = this;
      if (tool.group) {
        return !!tool.items.find(function (x) {
          return x.type === _this.data.tool;
        });
      }
      return tool.type === this.data.tool;
    }
  }
});
;// ./src/components/Toolbar.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Toolbarvue_type_script_lang_js = (Toolbarvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=style&index=0&id=320099a6&prod&lang=css
var Toolbarvue_type_style_index_0_id_320099a6_prod_lang_css = __webpack_require__(928);
;// ./src/components/Toolbar.vue?vue&type=style&index=0&id=320099a6&prod&lang=css

;// ./src/components/Toolbar.vue



;


/* normalize component */

var Toolbar_component = normalizeComponent(
  components_Toolbarvue_type_script_lang_js,
  Toolbarvue_type_template_id_320099a6_render,
  Toolbarvue_type_template_id_320099a6_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Toolbar = (Toolbar_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=template&id=296e303a
var Widgetsvue_type_template_id_296e303a_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    staticClass: "tvjs-widgets",
    style: {
      width: _vm.width + 'px',
      height: _vm.height + 'px'
    }
  }, _vm._l(Object.keys(_vm.map), function (id) {
    return _c(_vm.initw(id), {
      key: id,
      tag: "component",
      attrs: {
        "id": id,
        "main": _vm.map[id].ctrl,
        "data": _vm.map[id].data,
        "tv": _vm.tv,
        "dc": _vm.dc
      }
    });
  }), 1);
};
var Widgetsvue_type_template_id_296e303a_staticRenderFns = [];
Widgetsvue_type_template_id_296e303a_render._withStripped = true;

;// ./src/components/Widgets.vue?vue&type=template&id=296e303a

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=script&lang=js
/* harmony default export */ const Widgetsvue_type_script_lang_js = ({
  name: 'Widgets',
  props: ['width', 'height', 'map', 'tv', 'dc'],
  methods: {
    initw: function initw(id) {
      return this.$props.map[id].cls;
    }
  }
});
;// ./src/components/Widgets.vue?vue&type=script&lang=js
 /* harmony default export */ const components_Widgetsvue_type_script_lang_js = (Widgetsvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=style&index=0&id=296e303a&prod&lang=css
var Widgetsvue_type_style_index_0_id_296e303a_prod_lang_css = __webpack_require__(427);
;// ./src/components/Widgets.vue?vue&type=style&index=0&id=296e303a&prod&lang=css

;// ./src/components/Widgets.vue



;


/* normalize component */

var Widgets_component = normalizeComponent(
  components_Widgetsvue_type_script_lang_js,
  Widgetsvue_type_template_id_296e303a_render,
  Widgetsvue_type_template_id_296e303a_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Widgets = (Widgets_component.exports);
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=template&id=1be6bf21
var TheTipvue_type_template_id_1be6bf21_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    staticClass: "tvjs-the-tip",
    style: _vm.style,
    domProps: {
      "innerHTML": _vm._s(_vm.data.text)
    },
    on: {
      "mousedown": function mousedown($event) {
        return _vm.$emit('remove-me');
      }
    }
  });
};
var TheTipvue_type_template_id_1be6bf21_staticRenderFns = [];
TheTipvue_type_template_id_1be6bf21_render._withStripped = true;

;// ./src/components/TheTip.vue?vue&type=template&id=1be6bf21

;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=script&lang=js
/* harmony default export */ const TheTipvue_type_script_lang_js = ({
  name: 'TheTip',
  props: ['data'],
  computed: {
    style: function style() {
      return {
        background: this.data.color
      };
    }
  },
  mounted: function mounted() {
    var _this = this;
    setTimeout(function () {
      return _this.$emit('remove-me');
    }, 3000);
  }
});
;// ./src/components/TheTip.vue?vue&type=script&lang=js
 /* harmony default export */ const components_TheTipvue_type_script_lang_js = (TheTipvue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=style&index=0&id=1be6bf21&prod&lang=css
var TheTipvue_type_style_index_0_id_1be6bf21_prod_lang_css = __webpack_require__(892);
;// ./src/components/TheTip.vue?vue&type=style&index=0&id=1be6bf21&prod&lang=css

;// ./src/components/TheTip.vue



;


/* normalize component */

var TheTip_component = normalizeComponent(
  components_TheTipvue_type_script_lang_js,
  TheTipvue_type_template_id_1be6bf21_render,
  TheTipvue_type_template_id_1be6bf21_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const TheTip = (TheTip_component.exports);
;// ./src/mixins/xcontrol.js
function xcontrol_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = xcontrol_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function xcontrol_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return xcontrol_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? xcontrol_arrayLikeToArray(r, a) : void 0; } }
function xcontrol_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// extensions control

/* harmony default export */ const xcontrol = ({
  mounted: function mounted() {
    this.ctrllist();
    this.skin_styles();
  },
  methods: {
    // Build / rebuild component list
    ctrllist: function ctrllist() {
      this.ctrl_destroy();
      this.controllers = [];
      var _iterator = xcontrol_createForOfIteratorHelper(this.$props.extensions),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var x = _step.value;
          var name = x.Main.__name__;
          if (!this.xSettings[name]) {
            this.$set(this.xSettings, name, {});
          }
          var nc = new x.Main(this,
          // tv inst
          this.data,
          // dc
          this.xSettings[name] // settings
          );
          nc.name = name;
          this.controllers.push(nc);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return this.controllers;
    },
    // TODO: preventDefault
    pre_dc: function pre_dc(e) {
      var _iterator2 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ctrl = _step2.value;
          if (ctrl.update) {
            ctrl.update(e);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    },
    post_dc: function post_dc(e) {
      var _iterator3 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ctrl = _step3.value;
          if (ctrl.post_update) {
            ctrl.post_update(e);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    },
    ctrl_destroy: function ctrl_destroy() {
      var _iterator4 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var ctrl = _step4.value;
          if (ctrl.destroy) ctrl.destroy();
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    },
    skin_styles: function skin_styles() {
      var id = 'tvjs-skin-styles';
      var stbr = document.getElementById(id);
      if (stbr) {
        var parent = stbr.parentNode;
        parent.removeChild(stbr);
      }
      if (this.skin_proto && this.skin_proto.styles) {
        var sheet = document.createElement('style');
        sheet.setAttribute('id', id);
        sheet.innerHTML = this.skin_proto.styles;
        this.$el.appendChild(sheet);
      }
    }
  },
  computed: {
    ws: function ws() {
      var ws = {};
      var _iterator5 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var ctrl = _step5.value;
          if (ctrl.widgets) {
            for (var id in ctrl.widgets) {
              ws[id] = ctrl.widgets[id];
              ws[id].ctrl = ctrl;
            }
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      return ws;
    },
    skins: function skins() {
      var sks = {};
      var _iterator6 = xcontrol_createForOfIteratorHelper(this.$props.extensions),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var x = _step6.value;
          for (var id in x.skins || {}) {
            sks[id] = x.skins[id];
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      return sks;
    },
    skin_proto: function skin_proto() {
      return this.skins[this.$props.skin];
    },
    colorpack: function colorpack() {
      var sel = this.skins[this.$props.skin];
      return sel ? sel.colors : undefined;
    }
  },
  watch: {
    // TODO: This is fast & dirty fix, need
    // to fix the actual reactivity problem
    skin: function skin(n, p) {
      if (n !== p) this.resetChart();
      this.skin_styles();
    },
    extensions: function extensions() {
      this.ctrllist();
    },
    xSettings: {
      handler: function handler(n, p) {
        var _iterator7 = xcontrol_createForOfIteratorHelper(this.controllers),
          _step7;
        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var ctrl = _step7.value;
            if (ctrl.onsettings) {
              ctrl.onsettings(n, p);
            }
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }
      },
      deep: true
    }
  },
  data: function data() {
    return {
      controllers: []
    };
  }
});
;// ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=script&lang=js

function TradingVuevue_type_script_lang_js_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = TradingVuevue_type_script_lang_js_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function TradingVuevue_type_script_lang_js_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return TradingVuevue_type_script_lang_js_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? TradingVuevue_type_script_lang_js_arrayLikeToArray(r, a) : void 0; } }
function TradingVuevue_type_script_lang_js_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }







/* harmony default export */ const TradingVuevue_type_script_lang_js = ({
  name: "TradingVue",
  components: {
    Chart: Chart,
    Toolbar: Toolbar,
    Widgets: Widgets,
    TheTip: TheTip
  },
  mixins: [xcontrol],
  props: {
    titleTxt: {
      type: String,
      "default": "TradingVue.js"
    },
    id: {
      type: String,
      "default": "trading-vue-js"
    },
    width: {
      type: Number,
      "default": 800
    },
    height: {
      type: Number,
      "default": 421
    },
    colorTitle: {
      type: String,
      "default": "#42b883"
    },
    colorBack: {
      type: String,
      "default": "#121826"
    },
    colorGrid: {
      type: String,
      "default": "#2f3240"
    },
    colorText: {
      type: String,
      "default": "#dedddd"
    },
    colorTextHL: {
      type: String,
      "default": "#fff"
    },
    colorScale: {
      type: String,
      "default": "#838383"
    },
    colorCross: {
      type: String,
      "default": "#8091a0"
    },
    colorCandleUp: {
      type: String,
      "default": "#23a776"
    },
    colorCandleDw: {
      type: String,
      "default": "#e54150"
    },
    colorWickUp: {
      type: String,
      "default": "#23a77688"
    },
    colorWickDw: {
      type: String,
      "default": "#e5415088"
    },
    colorWickSm: {
      type: String,
      "default": "transparent" // deprecated
    },
    colorVolUp: {
      type: String,
      "default": "#79999e42"
    },
    colorVolDw: {
      type: String,
      "default": "#ef535042"
    },
    colorPanel: {
      type: String,
      "default": "#565c68"
    },
    colorTbBack: {
      type: String
    },
    colorTbBorder: {
      type: String,
      "default": "#8282827d"
    },
    colors: {
      type: Object
    },
    font: {
      type: String,
      "default": constants.ChartConfig.FONT
    },
    toolbar: {
      type: Boolean,
      "default": false
    },
    data: {
      type: Object,
      required: true
    },
    enableSideBarBoxValue: {
      type: Boolean,
      "default": false
    },
    // Your overlay classes here
    overlays: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    // Overwrites ChartConfig values,
    // see constants.js
    chartConfig: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    legendButtons: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    legendDecimal: {
      type: Boolean,
      "default": false
    },
    indexBased: {
      type: Boolean,
      "default": false
    },
    extensions: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    xSettings: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    skin: {
      type: String // Skin Name
    },
    timezone: {
      type: Number,
      "default": 0
    },
    enableZoom: {
      type: Boolean,
      "default": false
    },
    priceLine: {
      type: Boolean,
      "default": true
    },
    decimalPlace: {
      type: Number,
      "default": 2
    },
    applyShaders: {
      type: Boolean,
      "default": true
    },
    enableCrosshair: {
      type: Boolean,
      "default": false
    },
    enableArrow: {
      type: Boolean,
      "default": false
    },
    ignoreNegativeIndex: {
      type: Boolean,
      "default": false
    },
    ignore_OHLC: {
      type: Array[Object],
      "default": function _default() {
        return [];
      }
    },
    showSettingsButton: {
      type: Array[Object],
      "default": function _default() {
        return [];
      }
    },
    showTitleChartLegend: {
      type: Boolean,
      "default": false
    },
    isOverlayCollapsed: {
      type: Boolean,
      "default": false
    },
    collpaseButton: {
      type: Boolean,
      "default": false
    }
  },
  data: function data() {
    return {
      reset: 0,
      tip: null
    };
  },
  computed: {
    // Copy a subset of TradingVue props
    chart_props: function chart_props() {
      var offset = this.$props.toolbar ? this.chart_config.TOOLBAR : 0;
      var chart_props = {
        title_txt: this.$props.titleTxt,
        overlays: this.$props.overlays.concat(this.mod_ovs),
        data: this.decubed,
        width: this.$props.width - offset,
        height: this.$props.height,
        font: this.font_comp,
        buttons: this.$props.legendButtons,
        toolbar: this.$props.toolbar,
        ib: this.$props.indexBased || this.index_based || false,
        colors: Object.assign({}, this.$props.colors || this.colorpack),
        skin: this.skin_proto,
        timezone: this.$props.timezone,
        showSettingsButton: this.$props.showSettingsButton
      };
      this.parse_colors(chart_props.colors);
      return chart_props;
    },
    chart_config: function chart_config() {
      return Object.assign({}, constants.ChartConfig, this.$props.chartConfig);
    },
    decubed: function decubed() {
      var data = this.$props.data;
      if (data.data !== undefined) {
        // DataCube detected
        data.init_tvjs(this);
        return data.data;
      } else {
        return data;
      }
    },
    index_based: function index_based() {
      var base = this.$props.data;
      if (base.chart) {
        return base.chart.indexBased;
      } else if (base.data) {
        return base.data.chart.indexBased;
      }
      return false;
    },
    mod_ovs: function mod_ovs() {
      var arr = [];
      var _iterator = TradingVuevue_type_script_lang_js_createForOfIteratorHelper(this.$props.extensions),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var x = _step.value;
          arr.push.apply(arr, _toConsumableArray(Object.values(x.overlays)));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return arr;
    },
    font_comp: function font_comp() {
      return this.skin_proto && this.skin_proto.font ? this.skin_proto.font : this.font;
    },
    auto_y_axis: function auto_y_axis() {
      var _this$$refs$chart;
      return ((_this$$refs$chart = this.$refs.chart) === null || _this$$refs$chart === void 0 ? void 0 : _this$$refs$chart.auto_y_axis) || true;
    }
  },
  beforeDestroy: function beforeDestroy() {
    this.custom_event({
      event: "before-destroy"
    });
    this.ctrl_destroy();
  },
  methods: {
    chart_data_changed: function chart_data_changed(flag) {
      this.$emit("chart_data_changed", flag);
    },
    // TODO: reset extensions?
    resetChart: function resetChart(resetRange) {
      var _this = this;
      if (resetRange === void 0) {
        resetRange = true;
      }
      this.reset++;
      var range = this.getRange();
      if (!resetRange && range[0] && range[1]) {
        this.$nextTick(function () {
          return _this.setRange.apply(_this, _toConsumableArray(range));
        });
      }
      if (resetRange) {
        var _this$$refs;
        var initRange = (_this$$refs = this.$refs) === null || _this$$refs === void 0 || (_this$$refs = _this$$refs.chart) === null || _this$$refs === void 0 ? void 0 : _this$$refs.initRange;
        if (initRange && initRange !== null && initRange !== void 0 && initRange[0] && initRange !== null && initRange !== void 0 && initRange[1]) {
          this.$nextTick(function () {
            return _this.setRange.apply(_this, _toConsumableArray(initRange));
          });
        }
      }
      this.$nextTick(function () {
        return _this.custom_event({
          event: "chart-reset",
          args: []
        });
      });
    },
    updateChart: function updateChart() {
      //  console.log(" update chart was called")
      //       this.$nextTick(() =>
      //         this.custom_event({
      //           event: "?chart-resize",
      //           args:[]
      //         })
      //       );
    },
    "goto": function goto(t) {
      // TODO: limit goto & setRange (out of data error)
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        t = ti_map.gt2i(t, this.$refs.chart.ohlcv);
      }
      this.$refs.chart["goto"](t);
    },
    setRange: function setRange(t1, t2) {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        var ohlcv = this.$refs.chart.ohlcv;
        t1 = ti_map.gt2i(t1, ohlcv);
        t2 = ti_map.gt2i(t2, ohlcv);
        // console.log('this.ignoreNegativeIndex and t1',t1, t2,this.ignoreNegativeIndex)
        if (t1 < 0 && this.ignoreNegativeIndex) {
          t1 = 0;
        }
      }
      this.$refs.chart.setRange(t1, t2);
    },
    getRange: function getRange() {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        // Time range => index range
        // console.log('this.$refs.chart',this.$refs.chart)
        return this.$refs.chart.range.map(function (x) {
          return ti_map.i2t(x);
        });
      }
      return this.$refs.chart.range;
    },
    getCursor: function getCursor() {
      var cursor = this.$refs.chart.cursor;
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        var copy = Object.assign({}, cursor);
        copy.i = copy.t;
        copy.t = ti_map.i2t(copy.t);
        return copy;
      }
      return cursor;
    },
    getTimeIndex: function getTimeIndex(t) {
      // let cursor = this.$refs.chart.cursor;
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        // let copy = Object.assign({}, cursor);
        // copy.i = copy.t;
        // copy.t = ti_map.i2t(copy.t);
        return ti_map.t2i(t);
      }
      return null;
    },
    showTheTip: function showTheTip(text, color) {
      if (color === void 0) {
        color = "orange";
      }
      this.tip = {
        text: text,
        color: color
      };
    },
    legend_button: function legend_button(event) {
      this.custom_event({
        event: "legend-button-click",
        args: [event]
      });
    },
    collapse_button: function collapse_button(event) {
      this.custom_event({
        event: "on-collapse-change",
        args: [event]
      });
    },
    custom_event: function custom_event(d) {
      if ("args" in d) {
        this.$emit.apply(this, [d.event].concat(_toConsumableArray(d.args)));
      } else {
        this.$emit(d.event);
      }
      var data = this.$props.data;
      var ctrl = this.controllers.length !== 0;
      if (ctrl) this.pre_dc(d);
      if (data.tv) {
        // If the data object is DataCube
        data.on_custom_event(d.event, d.args);
      }
      if (ctrl) this.post_dc(d);
    },
    range_changed: function range_changed(r, manualInteraction) {
      if (manualInteraction === void 0) {
        manualInteraction = false;
      }
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        r = r.map(function (x) {
          return ti_map.i2t(x);
        });
      }
      // update
      this.$emit("range-changed", r, manualInteraction);

      // this.custom_event({ event: "range-changed", args: [r,r2] });
      if (this.onrange) this.onrange(r);
    },
    sidebar_transform: function sidebar_transform(y_transform) {
      this.$emit('sidebar-transform', y_transform);
    },
    set_loader: function set_loader(dc) {
      var _this2 = this;
      this.onrange = function (r) {
        var pf = _this2.chart_props.ib ? "_ms" : "";
        var tf = _this2.$refs.chart["interval" + pf];
        dc.range_changed(r, tf);
      };
    },
    parse_colors: function parse_colors(colors) {
      for (var k in this.$props) {
        if (k.indexOf("color") === 0 && k !== "colors") {
          var k2 = k.replace("color", "");
          k2 = k2[0].toLowerCase() + k2.slice(1);
          if (colors[k2]) continue;
          colors[k2] = this.$props[k];
        }
      }
    },
    mousedown: function mousedown() {
      this.$refs.chart.activated = true;
    },
    mouseleave: function mouseleave() {
      this.$refs.chart.activated = false;
    },
    toggleSideBarYAxis: function toggleSideBarYAxis() {
      this.$refs.chart.toggleSideBarYAxis();
    },
    toggleSidebarCustomRange: function toggleSidebarCustomRange(verticalRange) {
      this.$refs.chart.toggleSidebarCustomRange(verticalRange);
    }
  },
  watch: {
    decimalPlace: function decimalPlace(n) {
      var base = this.$props.data;
      // console.log("props:",base);
      base.merge('chart.settings', {
        decimalPlace: n
      });
    },
    enableArrow: function enableArrow(n) {
      var base = this.$props.data;
      // console.log("props:",base);
      base.merge('chart.settings', {
        isArrow: n
      });
    }
  },
  mounted: function mounted() {
    var base = this.$props.data;
    // console.log("props:",this.$props.enableArrow);
    base.merge('chart.settings', {
      isArrow: this.$props.enableArrow,
      decimalPlace: this.$props.decimalPlace
    });
  }
});
;// ./src/TradingVue.vue?vue&type=script&lang=js
 /* harmony default export */ const src_TradingVuevue_type_script_lang_js = (TradingVuevue_type_script_lang_js); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=style&index=0&id=3866ff4a&prod&lang=css
var TradingVuevue_type_style_index_0_id_3866ff4a_prod_lang_css = __webpack_require__(255);
;// ./src/TradingVue.vue?vue&type=style&index=0&id=3866ff4a&prod&lang=css

;// ./src/TradingVue.vue



;


/* normalize component */

var TradingVue_component = normalizeComponent(
  src_TradingVuevue_type_script_lang_js,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const TradingVue = (TradingVue_component.exports);
;// ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}

// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(756);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);
;// ./src/helpers/tmp/ww$$$.json
const ww$$$_namespaceObject = /*#__PURE__*/JSON.parse('["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"]');
// EXTERNAL MODULE: ./node_modules/lz-string/libs/lz-string.js
var lz_string = __webpack_require__(992);
var lz_string_default = /*#__PURE__*/__webpack_require__.n(lz_string);
;// ./src/helpers/script_ww_api.js




// Webworker interface

// Compiled webworker (see webpack/ww_plugin.js)



 // For webworker-loader to find the ww
var WebWork = /*#__PURE__*/function () {
  function WebWork(dc) {
    classCallCheck_classCallCheck(this, WebWork);
    this.dc = dc;
    this.tasks = {};
    this.onevent = function () {};
    this.start();
  }
  return createClass_createClass(WebWork, [{
    key: "start",
    value: function start() {
      var _this = this;
      if (this.worker) this.worker.terminate();
      // URL.createObjectURL
      window.URL = window.URL || window.webkitURL;
      var data = lz_string_default().decompressFromBase64(ww$$$_namespaceObject[0]);
      var blob;
      try {
        blob = new Blob([data], {
          type: 'application/javascript'
        });
      } catch (e) {
        // Backwards-compatibility
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(data);
        blob = blob.getBlob();
      }
      this.worker = new Worker(URL.createObjectURL(blob));
      this.worker.onmessage = function (e) {
        return _this.onmessage(e);
      };
    }
  }, {
    key: "start_socket",
    value: function start_socket() {
      var _this2 = this;
      if (!this.dc.sett.node_url) return;
      this.socket = new WebSocket(this.dc.sett.node_url);
      this.socket.addEventListener('message', function (e) {
        _this2.onmessage({
          data: JSON.parse(e.data)
        });
      });
      this.msg_queue = [];
    }
  }, {
    key: "send",
    value: function send(msg, tx_keys) {
      if (this.dc.sett.node_url) {
        return this.send_node(msg, tx_keys);
      }
      if (tx_keys) {
        var tx_objs = tx_keys.map(function (k) {
          return msg.data[k];
        });
        this.worker.postMessage(msg, tx_objs);
      } else {
        this.worker.postMessage(msg);
      }
    }

    // Send to node.js via websocket
  }, {
    key: "send_node",
    value: function send_node(msg, tx_keys) {
      if (!this.socket) this.start_socket();
      if (this.socket && this.socket.readyState) {
        // Send the old messages first
        while (this.msg_queue.length) {
          var m = this.msg_queue.shift();
          this.socket.send(JSON.stringify(m));
        }
        this.socket.send(JSON.stringify(msg));
      } else {
        this.msg_queue.push(msg);
      }
    }
  }, {
    key: "onmessage",
    value: function onmessage(e) {
      if (e.data.id in this.tasks) {
        this.tasks[e.data.id](e.data.data);
        delete this.tasks[e.data.id];
      } else {
        this.onevent(e);
      }
    }

    // Execute a task
  }, {
    key: "exec",
    value: function () {
      var _exec = _asyncToGenerator(/*#__PURE__*/regenerator_default().mark(function _callee(type, data, tx_keys) {
        var _this3 = this;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (rs, rj) {
                var id = utils.uuid();
                _this3.send({
                  type: type,
                  id: id,
                  data: data
                }, tx_keys);
                _this3.tasks[id] = function (res) {
                  rs(res);
                };
              }));
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function exec(_x, _x2, _x3) {
        return _exec.apply(this, arguments);
      }
      return exec;
    }() // Execute a task, but just fucking do it,
    // do not wait for the result
  }, {
    key: "just",
    value: function just(type, data, tx_keys) {
      var id = utils.uuid();
      this.send({
        type: type,
        id: id,
        data: data
      }, tx_keys);
    }

    // Relay an event from iframe postMessage
    // (for the future)
  }, {
    key: "relay",
    value: function () {
      var _relay = _asyncToGenerator(/*#__PURE__*/regenerator_default().mark(function _callee2(event, just) {
        var _this4 = this;
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (just === void 0) {
                just = false;
              }
              return _context2.abrupt("return", new Promise(function (rs, rj) {
                _this4.send(event, event.tx_keys);
                if (!just) {
                  _this4.tasks[event.id] = function (res) {
                    rs(res);
                  };
                }
              }));
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function relay(_x4, _x5) {
        return _relay.apply(this, arguments);
      }
      return relay;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.worker) this.worker.terminate();
    }
  }]);
}();
/* harmony default export */ const script_ww_api = (WebWork);
;// ./src/helpers/script_utils.js


var FDEFS = /(function |)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\((.*?)\)/gmi;
var SBRACKETS = /([$A-Z_][0-9A-Z_$\.]*)[\s]*?\[([^"^\[^\]]+?)\]/gmi;
var TFSTR = /(\d+)(\w*)/gm;
var BUF_INC = 5;
var tf_cache = {};
function f_args(src) {
  FDEFS.lastIndex = 0;
  var m = FDEFS.exec(src);
  if (m) {
    var fkeyword = m[1].trim();
    var fname = m[2].trim();
    var fargs = m[3].trim();
    return fargs.split(',').map(function (x) {
      return x.trim();
    });
  }
  return [];
}
function f_body(src) {
  return src.slice(src.indexOf('{') + 1, src.lastIndexOf('}'));
}
function wrap_idxs(src, pre) {
  if (pre === void 0) {
    pre = '';
  }
  SBRACKETS.lastIndex = 0;
  var changed = false;
  do {
    var m = SBRACKETS.exec(src);
    if (m) {
      var vname = m[1].trim();
      var vindex = m[2].trim();
      if (vindex === '0' || parseInt(vindex) < BUF_INC) {
        continue;
      }
      switch (vname) {
        case 'let':
        case 'var':
        case 'return':
          continue;
      }

      //let wrap = `${pre}_v(${vname}, ${vindex})[${vindex}]`
      var wrap = "".concat(vname, "[").concat(pre, "_i(").concat(vindex, ", ").concat(vname, ")]");
      src = src.replace(m[0], wrap);
      changed = true;
    }
  } while (m);
  return changed ? src : src;
}

// Get all module helper classes
function make_module_lib(mod) {
  var lib = {};
  for (var k in mod) {
    if (k === 'main' || k === 'id') continue;
    var a = f_args(mod[k]);
    lib[k] = new Function(a, f_body(mod[k]));
  }
  return lib;
}
function get_raw_src(f) {
  if (typeof f === 'string') return f;
  var src = f.toString();
  return src.slice(src.indexOf('{') + 1, src.lastIndexOf('}'));
}

// Get tf in ms from pairs such (`15`, `m`)
function tf_from_pair(num, pf) {
  var mult = 1;
  switch (pf) {
    case 's':
      mult = Const.SECOND;
      break;
    case 'm':
      mult = Const.MINUTE;
      break;
    case 'H':
      mult = Const.HOUR;
      break;
    case 'D':
      mult = Const.DAY;
      break;
    case 'W':
      mult = Const.WEEK;
      break;
    case 'M':
      mult = Const.MONTH;
      break;
    case 'Y':
      mult = Const.YEAR;
      break;
  }
  return parseInt(num) * mult;
}
function tf_from_str(str) {
  if (typeof str === 'number') return str;
  if (tf_cache[str]) return tf_cache[str];
  TFSTR.lastIndex = 0;
  var m = TFSTR.exec(str);
  if (m) {
    tf_cache[str] = tf_from_pair(m[1], m[2]);
    return tf_cache[str];
  }
  return undefined;
}
function get_fn_id(pre, id) {
  return pre + '-' + id.split('<-').pop();
}

// Apply filter for all new overlays
function ovf(obj, f) {
  var nw = {};
  for (var id in obj) {
    nw[id] = {};
    for (var k in obj[id]) {
      if (k === 'data') continue;
      nw[id][k] = obj[id][k];
    }
    nw[id].data = f(obj[id].data);
  }
  return nw;
}

// Return index of the next element in
// dataset (since t). Impl: simple binary search
// TODO: optimize (remember the penultimate
// iteration and start from there)
function nextt(data, t, ti) {
  if (ti === void 0) {
    ti = 0;
  }
  var i0 = 0;
  var iN = data.length - 1;
  while (i0 <= iN) {
    var mid = Math.floor((i0 + iN) / 2);
    if (data[mid][ti] === t) {
      return mid;
    } else if (data[mid][ti] < t) {
      i0 = mid + 1;
    } else {
      iN = mid - 1;
    }
  }
  return t < data[mid][ti] ? mid : mid + 1;
}

// Estimated size of datasets
function size_of_dss(data) {
  var bytes = 0;
  for (var id in data) {
    if (data[id].data && data[id].data[0]) {
      var s0 = size_of(data[id].data[0]);
      bytes += s0 * data[id].data.length;
    }
  }
  return bytes;
}

// Used to measure the size of dataset
function size_of(object) {
  var list = [],
    stack = [object],
    bytes = 0;
  while (stack.length) {
    var value = stack.pop();
    var type = _typeof(value);
    if (type === 'boolean') {
      bytes += 4;
    } else if (type === 'string') {
      bytes += value.length * 2;
    } else if (type === 'number') {
      bytes += 8;
    } else if (type === 'object' && list.indexOf(value) === -1) {
      list.push(value);
      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }
  return bytes;
}

// Update onchart/offchart
function update(data, val) {
  var i = data.length - 1;
  var last = data[i];
  if (!last || val[0] > last[0]) {
    data.push(val);
  } else {
    data[i] = val;
  }
}
function script_utils_now() {
  return new Date().getTime();
}
;// ./src/helpers/dataset.js




function dataset_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = dataset_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function dataset_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return dataset_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? dataset_arrayLikeToArray(r, a) : void 0; } }
function dataset_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }

// Dataset proxy between vuejs & WebWorker


var Dataset = /*#__PURE__*/function () {
  function Dataset(dc, desc) {
    classCallCheck_classCallCheck(this, Dataset);
    // TODO: dataset url arrow fn tells WW
    // to load the ds directly from web

    this.type = desc.type;
    this.id = desc.id;
    this.dc = dc;

    // Send the data to WW
    if (desc.data) {
      this.dc.ww.just('upload-data', _defineProperty({}, this.id, desc));
      // Remove the data from the descriptor
      delete desc.data;
    }
    var proto = Object.getPrototypeOf(this);
    Object.setPrototypeOf(desc, proto);
    Object.defineProperty(desc, 'dc', {
      get: function get() {
        return dc;
      }
    });
  }

  // Watch for the changes of descriptors
  return createClass_createClass(Dataset, [{
    key: "set",
    value:
    // Set data (overwrite the whole dataset)
    function set(data, exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'set',
        data: data,
        exec: exec
      });
    }

    // Update with new data (array of data points)
  }, {
    key: "update",
    value: function update(arr) {
      this.dc.ww.just('update-data', _defineProperty({}, this.id, arr));
    }

    // Send WW a chunk to merge. The merge algo
    // here is simpler than in DC. It just adds
    // data at the beginning or/and the end of ds
  }, {
    key: "merge",
    value: function merge(data, exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'mrg',
        data: data,
        exec: exec
      });
    }

    // Remove the ds from WW
  }, {
    key: "remove",
    value: function remove(exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.del("datasets.".concat(this.id));
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'del',
        exec: exec
      });
      delete this.dc.dss[this.id];
    }

    // Fetch data from WW
  }, {
    key: "data",
    value: function () {
      var _data = _asyncToGenerator(/*#__PURE__*/regenerator_default().mark(function _callee() {
        var ds;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.dc.ww.exec('get-dataset', this.id);
            case 2:
              ds = _context.sent;
              if (ds) {
                _context.next = 5;
                break;
              }
              return _context.abrupt("return");
            case 5:
              return _context.abrupt("return", ds.data);
            case 6:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function data() {
        return _data.apply(this, arguments);
      }
      return data;
    }()
  }], [{
    key: "watcher",
    value: function watcher(n, p) {
      var nids = n.map(function (x) {
        return x.id;
      });
      var pids = p.map(function (x) {
        return x.id;
      });
      var _iterator = dataset_createForOfIteratorHelper(nids),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var id = _step.value;
          if (!pids.includes(id)) {
            var ds = n.filter(function (x) {
              return x.id === id;
            })[0];
            this.dss[id] = new Dataset(this, ds);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var _iterator2 = dataset_createForOfIteratorHelper(pids),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var id = _step2.value;
          if (!nids.includes(id) && this.dss[id]) {
            this.dss[id].remove();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    // Make an object for data transfer
  }, {
    key: "make_tx",
    value: function make_tx(dc, types) {
      var main = dc.data.chart.data;
      var base = {};
      if (types.find(function (x) {
        return x.type === 'OHLCV';
      })) {
        base = {
          ohlcv: main
        };
      }

      // TODO: add more sophisticated search
      // (using 'script.datasets' paramerter)
      /*for (var req of types) {
          let ds = Object.values(dc.dss || {})
              .find(x => x.type === req.type)
          if (ds && ds.data) {
              base[ds.id] = {
                  id: ds.id,
                  type: ds.type,
                  data: ds.data
              }
          }
      }*/
      // TODO: Data request callback ?

      return base;
    }
  }]);
}(); // Dataset reciever (created on WW)

var DatasetWW = /*#__PURE__*/(/* unused pure expression or super */ null && (function () {
  function DatasetWW(id, data) {
    _classCallCheck(this, DatasetWW);
    this.last_upd = now();
    this.id = id;
    if (Array.isArray(data)) {
      // Regular array
      this.data = data;
      if (id === 'ohlcv') this.type = 'OHLCV';
    } else {
      // Dataset descriptor
      this.data = data.data;
      this.type = data.type;
    }
  }

  // Update from 'update-data' event
  // TODO: ds size limit (in MB / data points)
  return _createClass(DatasetWW, [{
    key: "merge",
    value: function merge(data) {
      var len = this.data.length;
      if (!len) {
        this.data = data;
        return;
      }
      var t0 = this.data[0][0];
      var tN = this.data[len - 1][0];
      var l = data.filter(function (x) {
        return x[0] < t0;
      });
      var r = data.filter(function (x) {
        return x[0] > tN;
      });
      this.data = l.concat(this.data, r);
    }

    // On dataset operation
  }, {
    key: "op",
    value: function op(se, _op) {
      this.last_upd = now();
      switch (_op.type) {
        case 'set':
          this.data = _op.data;
          se.recalc_size();
          break;
        case 'del':
          delete se.data[this.id];
          se.recalc_size();
          break;
        case 'mrg':
          this.merge(_op.data);
          se.recalc_size();
          break;
      }
    }
  }], [{
    key: "update_all",
    value: function update_all(se, data) {
      for (var k in data) {
        if (k === 'ohlcv') continue;
        var id = k.split('.')[1] || k;
        if (!se.data[id]) continue;
        var arr = se.data[id].data;
        var iN = arr.length - 1;
        var last = arr[iN];
        var _iterator3 = dataset_createForOfIteratorHelper(data[k]),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var dp = _step3.value;
            if (!last || dp[0] > last[0]) {
              arr.push(dp);
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        se.data[id].last_upd = now();
      }
    }
  }]);
}()));
;// ./src/helpers/dc_events.js




function dc_events_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = dc_events_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function dc_events_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return dc_events_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? dc_events_arrayLikeToArray(r, a) : void 0; } }
function dc_events_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// DataCube event handlers





var DCEvents = /*#__PURE__*/function () {
  function DCEvents() {
    var _this = this;
    classCallCheck_classCallCheck(this, DCEvents);
    this.ww = new script_ww_api(this);

    // Listen to the web-worker events
    this.ww.onevent = function (e) {
      var _iterator = dc_events_createForOfIteratorHelper(_this.tv.controllers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ctrl = _step.value;
          if (ctrl.ww) ctrl.ww(e.data);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      switch (e.data.type) {
        case 'request-data':
          // TODO: DataTunnel class for smarter data transfer
          if (_this.ww._data_uploading) break;
          var data = Dataset.make_tx(_this, e.data.data);
          _this.send_meta_2_ww();
          _this.ww.just('upload-data', data);
          _this.ww._data_uploading = true;
          break;
        case 'overlay-data':
          _this.on_overlay_data(e.data.data);
          break;
        case 'overlay-update':
          _this.on_overlay_update(e.data.data);
          break;
        case 'data-uploaded':
          _this.ww._data_uploading = false;
          break;
        case 'engine-state':
          _this.se_state = Object.assign(_this.se_state || {}, e.data.data);
          break;
        case 'modify-overlay':
          _this.modify_overlay(e.data.data);
          break;
        case 'script-signal':
          _this.tv.$emit('signal', e.data.data);
          break;
      }
      var _iterator2 = dc_events_createForOfIteratorHelper(_this.tv.controllers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ctrl = _step2.value;
          if (ctrl.post_ww) ctrl.post_ww(e.data);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    };
  }

  // Called when overalay/tv emits 'custom-event'
  return createClass_createClass(DCEvents, [{
    key: "on_custom_event",
    value: function on_custom_event(event, args) {
      switch (event) {
        case 'register-tools':
          this.register_tools(args);
          break;
        case 'exec-script':
          this.exec_script(args);
          break;
        case 'exec-all-scripts':
          this.exec_all_scripts();
          break;
        case 'data-len-changed':
          this.data_changed(args);
          break;
        case 'tool-selected':
          if (!args[0]) break; // TODO: Quick fix, investigate
          if (args[0].split(':')[0] === 'System') {
            this.system_tool(args[0].split(':')[1]);
            break;
          }
          this.tv.$set(this.data, 'tool', args[0]);
          if (args[0] === 'Cursor') {
            this.drawing_mode_off();
          }
          break;
        case 'grid-mousedown':
          this.grid_mousedown(args);
          break;
        case 'drawing-mode-off':
          this.drawing_mode_off();
          break;
        case 'change-settings':
          this.change_settings(args);
          break;
        case 'range-changed':
          this.scripts_onrange.apply(this, _toConsumableArray(args));
          break;
        case 'scroll-lock':
          this.on_scroll_lock(args[0]);
          break;
        case 'object-selected':
          this.object_selected(args);
          break;
        case 'remove-tool':
          this.system_tool('Remove');
          break;
        case 'before-destroy':
          this.before_destroy();
          break;
      }
    }

    // Triggered when one or multiple settings are changed
    // We select only the changed ones & re-exec them on the
    // web worker
  }, {
    key: "on_settings",
    value: function on_settings(values, prev) {
      var _this2 = this;
      if (!this.sett.scripts) return;
      var delta = {};
      var changed = false;
      var _loop = function _loop() {
        var n = values[i];
        var arr = prev.filter(function (x) {
          return x.v === n.v;
        });
        if (!arr.length && n.p.settings.$props) {
          var id = n.p.settings.$uuid;
          if (utils.is_scr_props_upd(n, prev) && utils.delayed_exec(n.p)) {
            delta[id] = n.v;
            changed = true;
            _this2.tv.$set(n.p, 'loading', true);
          }
        }
      };
      for (var i = 0; i < values.length; i++) {
        _loop();
      }
      if (changed && Object.keys(delta).length) {
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        this.ww.just('update-ov-settings', {
          delta: delta,
          tf: tf,
          range: range
        });
      }
    }

    // When the set of $uuids is changed
  }, {
    key: "on_ids_changed",
    value: function on_ids_changed(values, prev) {
      var rem = prev.filter(function (x) {
        return x !== undefined && !values.includes(x);
      });
      if (rem.length) {
        this.ww.just('remove-scripts', rem);
      }
    }

    // Combine all tools and their mods
  }, {
    key: "register_tools",
    value: function register_tools(tools) {
      var preset = {};
      var _iterator3 = dc_events_createForOfIteratorHelper(this.data.tools || []),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var tool = _step3.value;
          preset[tool.type] = tool;
          delete tool.type;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.tv.$set(this.data, 'tools', []);
      var list = [{
        type: 'Cursor',
        icon: icons_namespaceObject["cursor.png"]
      }];
      var _iterator4 = dc_events_createForOfIteratorHelper(tools),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var tool = _step4.value;
          var proto = Object.assign({}, tool.info);
          var type = tool.info.type || 'Default';
          proto.type = "".concat(tool.use_for, ":").concat(type);
          this.merge_presets(proto, preset[tool.use_for]);
          this.merge_presets(proto, preset[proto.type]);
          delete proto.mods;
          list.push(proto);
          for (var mod in tool.info.mods) {
            var mp = Object.assign({}, proto);
            mp = Object.assign(mp, tool.info.mods[mod]);
            mp.type = "".concat(tool.use_for, ":").concat(mod);
            this.merge_presets(mp, preset[tool.use_for]);
            this.merge_presets(mp, preset[mp.type]);
            list.push(mp);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      this.tv.$set(this.data, 'tools', list);
      this.tv.$set(this.data, 'tool', 'Cursor');
    }
  }, {
    key: "exec_script",
    value: function exec_script(args) {
      if (args.length && this.sett.scripts) {
        var obj = this.get_overlay(args[0]);
        if (!obj || obj.scripts === false) return;
        if (obj.script && obj.script.src) {
          args[0].src = obj.script.src; // opt, override the src
        }
        // Parse script props & get the values from the ov
        // TODO: remove unnecessary script initializations
        var s = obj.settings;
        var props = args[0].src.props || {};
        if (!s.$uuid) s.$uuid = "".concat(obj.type, "-").concat(utils.uuid2());
        args[0].uuid = s.$uuid;
        args[0].sett = s;
        for (var k in props || {}) {
          var proto = props[k];
          if (s[k] !== undefined) {
            proto.val = s[k]; // use the existing val
            continue;
          }
          if (proto.def === undefined) {
            // TODO: add support of info / errors to the legend
            console.error("Overlay ".concat(obj.id, ": script prop '").concat(k, "' ") + 'doesn\'t have a default value');
            return;
          }
          s[k] = proto.val = proto.def; // set the default
        }
        // Remove old props (dropped by the current exec)
        if (s.$props) {
          for (var k in s) {
            if (s.$props.includes(k) && !(k in props)) {
              delete s[k];
            }
          }
        }
        s.$props = Object.keys(args[0].src.props || {});
        this.tv.$set(obj, 'loading', true);
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        if (obj.script && obj.script.output != null) {
          args[0].output = obj.script.output;
        }
        this.ww.just('exec-script', {
          s: args[0],
          tf: tf,
          range: range
        });
      }
    }
  }, {
    key: "exec_all_scripts",
    value: function exec_all_scripts() {
      if (!this.sett.scripts) return;
      this.set_loading(true);
      var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
      var range = this.tv.getRange();
      this.ww.just('exec-all-scripts', {
        tf: tf,
        range: range
      });
    }
  }, {
    key: "scripts_onrange",
    value: function scripts_onrange(r) {
      if (!this.sett.scripts) return;
      var delta = {};
      this.get('.').forEach(function (v) {
        if (v.script && v.script.execOnRange && v.settings.$uuid) {
          // TODO: execInterrupt flag?
          if (utils.delayed_exec(v)) {
            delta[v.settings.$uuid] = v.settings;
          }
        }
      });
      if (Object.keys(delta).length) {
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        this.ww.just('update-ov-settings', {
          delta: delta,
          tf: tf,
          range: range
        });
      }
    }

    // Overlay modification from WW
  }, {
    key: "modify_overlay",
    value: function modify_overlay(upd) {
      var obj = this.get_overlay(upd);
      if (obj) {
        for (var k in upd.fields || {}) {
          if (typeof_typeof(obj[k]) === 'object') {
            this.merge("".concat(upd.uuid, ".").concat(k), upd.fields[k]);
          } else {
            this.tv.$set(obj, k, upd.fields[k]);
          }
        }
      }
    }
  }, {
    key: "data_changed",
    value: function data_changed(args) {
      if (!this.sett.scripts) return;
      if (this.sett.data_change_exec === false) return;
      var main = this.data.chart.data;
      if (this.ww._data_uploading) return;
      if (!this.se_state.scripts) return;
      this.send_meta_2_ww();
      this.ww.just('upload-data', {
        ohlcv: main
      });
      this.ww._data_uploading = true;
      this.set_loading(true);
    }
  }, {
    key: "set_loading",
    value: function set_loading(flag) {
      var skrr = this.get('.').filter(function (x) {
        return x.settings.$props;
      });
      var _iterator5 = dc_events_createForOfIteratorHelper(skrr),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var s = _step5.value;
          this.merge("".concat(s.id), {
            loading: flag
          });
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  }, {
    key: "send_meta_2_ww",
    value: function send_meta_2_ww() {
      var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
      var range = this.tv.getRange();
      this.ww.just('send-meta-info', {
        tf: tf,
        range: range
      });
    }
  }, {
    key: "merge_presets",
    value: function merge_presets(proto, preset) {
      if (!preset) return;
      for (var k in preset) {
        if (k === 'settings') {
          Object.assign(proto[k], preset[k]);
        } else {
          proto[k] = preset[k];
        }
      }
    }
  }, {
    key: "grid_mousedown",
    value: function grid_mousedown(args) {
      var _this3 = this;
      // TODO: tool state finished?
      this.object_selected([]);
      // Remove the previous RangeTool
      var rem = function rem() {
        return _this3.get('RangeTool').filter(function (x) {
          return x.settings.shiftMode;
        }).forEach(function (x) {
          return _this3.del(x.id);
        });
      };
      if (this.data.tool && this.data.tool !== 'Cursor' && !this.data.drawingMode) {
        // Prevent from "null" tools (tool created with HODL)
        if (args[1].type !== 'tap') {
          this.tv.$set(this.data, 'drawingMode', true);
          this.build_tool(args[0]);
        } else {
          this.tv.showTheTip('<b>Hodl</b>+<b>Drug</b> to create, ' + '<b>Tap</b> to finish a tool');
        }
      } else if (this.sett.shift_measure && args[1].shiftKey) {
        rem();
        this.tv.$nextTick(function () {
          return _this3.build_tool(args[0], 'RangeTool:ShiftMode');
        });
      } else {
        rem();
      }
    }
  }, {
    key: "drawing_mode_off",
    value: function drawing_mode_off() {
      this.tv.$set(this.data, 'drawingMode', false);
      this.tv.$set(this.data, 'tool', 'Cursor');
    }

    // Place a new tool
  }, {
    key: "build_tool",
    value: function build_tool(grid_id, type) {
      var list = this.data.tools;
      type = type || this.data.tool;
      var proto = list.find(function (x) {
        return x.type === type;
      });
      if (!proto) return;
      var sett = Object.assign({}, proto.settings || {});
      var data = (proto.data || []).slice();
      if (!('legend' in sett)) sett.legend = false;
      if (!('z-index' in sett)) sett['z-index'] = 100;
      sett.$selected = true;
      sett.$state = 'wip';
      var side = grid_id ? 'offchart' : 'onchart';
      var id = this.add(side, {
        name: proto.name,
        type: type.split(':')[0],
        settings: sett,
        data: data,
        grid: {
          id: grid_id
        }
      });
      sett.$uuid = "".concat(id, "-").concat(utils.now());
      this.tv.$set(this.data, 'selected', sett.$uuid);
      this.add_trash_icon();
    }

    // Remove selected / Remove all, etc
  }, {
    key: "system_tool",
    value: function system_tool(type) {
      switch (type) {
        case 'Remove':
          if (this.data.selected) {
            this.del(this.data.selected);
            this.remove_trash_icon();
            this.drawing_mode_off();
            this.on_scroll_lock(false);
          }
          break;
      }
    }

    // Apply new overlay settings
  }, {
    key: "change_settings",
    value: function change_settings(args) {
      var settings = args[0];
      delete settings.id;
      var grid_id = args[1];
      this.merge("".concat(args[3], ".settings"), settings);
    }

    // Lock the scrolling mechanism
  }, {
    key: "on_scroll_lock",
    value: function on_scroll_lock(flag) {
      this.tv.$set(this.data, 'scrollLock', flag);
    }

    // When new object is selected / unselected
  }, {
    key: "object_selected",
    value: function object_selected(args) {
      var q = this.data.selected;
      if (q) {
        // Check if current drawing is finished
        //let res = this.get_one(`${q}.settings`)
        //if (res && res.$state !== 'finished') return
        this.merge("".concat(q, ".settings"), {
          $selected: false
        });
        this.remove_trash_icon();
      }
      this.tv.$set(this.data, 'selected', null);
      if (!args.length) return;
      this.tv.$set(this.data, 'selected', args[2]);
      this.merge("".concat(args[2], ".settings"), {
        $selected: true
      });
      this.add_trash_icon();
    }
  }, {
    key: "add_trash_icon",
    value: function add_trash_icon() {
      var type = 'System:Remove';
      if (this.data.tools.find(function (x) {
        return x.type === type;
      })) {
        return;
      }
      this.data.tools.push({
        type: type,
        icon: icons_namespaceObject["trash.png"]
      });
    }
  }, {
    key: "remove_trash_icon",
    value: function remove_trash_icon() {
      // TODO: Does not call Toolbar render (distr version)
      var type = 'System:Remove';
      utils.overwrite(this.data.tools, this.data.tools.filter(function (x) {
        return x.type !== type;
      }));
    }

    // Set overlay data from the web-worker
  }, {
    key: "on_overlay_data",
    value: function on_overlay_data(data) {
      var _this4 = this;
      this.get('.').forEach(function (x) {
        if (x.settings.$synth) _this4.del("".concat(x.id));
      });
      var _iterator6 = dc_events_createForOfIteratorHelper(data),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var ov = _step6.value;
          var obj = this.get_one("".concat(ov.id));
          if (obj) {
            this.tv.$set(obj, 'loading', false);
            if (!ov.data) continue;
            obj.data = ov.data;
          }
          if (!ov.new_ovs) continue;
          for (var id in ov.new_ovs.onchart) {
            if (!this.get_one("onchart.".concat(id))) {
              this.add('onchart', ov.new_ovs.onchart[id]);
            }
          }
          for (var id in ov.new_ovs.offchart) {
            if (!this.get_one("offchart.".concat(id))) {
              this.add('offchart', ov.new_ovs.offchart[id]);
            }
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    }

    // Push overlay updates from the web-worker
  }, {
    key: "on_overlay_update",
    value: function on_overlay_update(data) {
      var _iterator7 = dc_events_createForOfIteratorHelper(data),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var ov = _step7.value;
          if (!ov.data) continue;
          var obj = this.get_one("".concat(ov.id));
          if (obj) {
            this.fast_merge(obj.data, ov.data, false);
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }

    // Clean-up unfinished business (tools)
  }, {
    key: "before_destroy",
    value: function before_destroy() {
      var f = function f(x) {
        return !x.settings.$state || x.settings.$state === 'finished';
      };
      this.data.onchart = this.data.onchart.filter(f);
      this.data.offchart = this.data.offchart.filter(f);
      this.drawing_mode_off();
      this.on_scroll_lock(false);
      this.object_selected([]);
      this.ww.destroy();
    }

    // Get overlay by grid-layer id
  }, {
    key: "get_overlay",
    value: function get_overlay(obj) {
      var id = obj.id || "g".concat(obj.grid_id, "_").concat(obj.layer_id);
      var dcid = obj.uuid || this.gldc[id];
      return this.get_one("".concat(dcid));
    }
  }]);
}();

;// ./src/helpers/dc_core.js








function dc_core_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = dc_core_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function dc_core_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return dc_core_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? dc_core_arrayLikeToArray(r, a) : void 0; } }
function dc_core_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function dc_core_callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, dc_core_isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function dc_core_isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (dc_core_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
// DataCube "private" methods




var DCCore = /*#__PURE__*/function (_DCEvents) {
  function DCCore() {
    classCallCheck_classCallCheck(this, DCCore);
    return dc_core_callSuper(this, DCCore, arguments);
  }
  _inherits(DCCore, _DCEvents);
  return createClass_createClass(DCCore, [{
    key: "init_tvjs",
    value:
    // Set TV instance (once). Called by TradingVue itself
    function init_tvjs($root) {
      var _this = this;
      if (!this.tv) {
        this.tv = $root;
        this.init_data();
        this.update_ids();

        // Listen to all setting changes
        // TODO: works only with merge()
        this.tv.$watch(function () {
          return _this.get_by_query('.settings');
        }, function (n, p) {
          return _this.on_settings(n, p);
        });

        // Listen to all indices changes
        this.tv.$watch(function () {
          return _this.get('.').map(function (x) {
            return x.settings.$uuid;
          });
        }, function (n, p) {
          return _this.on_ids_changed(n, p);
        });

        // Watch for all 'datasets' changes
        this.tv.$watch(function () {
          return _this.get('datasets');
        }, Dataset.watcher.bind(this));
      }
    }

    // Init Data Structure v1.1
  }, {
    key: "init_data",
    value: function init_data($root) {
      if (!('chart' in this.data)) {
        this.tv.$set(this.data, 'chart', {
          type: 'Candles',
          data: this.data.ohlcv || []
        });
      }
      if (!('onchart' in this.data)) {
        this.tv.$set(this.data, 'onchart', []);
      }
      if (!('offchart' in this.data)) {
        this.tv.$set(this.data, 'offchart', []);
      }
      if (!this.data.chart.settings) {
        this.tv.$set(this.data.chart, 'settings', {});
      }

      // Remove ohlcv cuz we have Data v1.1^
      delete this.data.ohlcv;
      if (!('datasets' in this.data)) {
        this.tv.$set(this.data, 'datasets', []);
      }

      // Init dataset proxies
      var _iterator = dc_core_createForOfIteratorHelper(this.data.datasets),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ds = _step.value;
          if (!this.dss) this.dss = {};
          this.dss[ds.id] = new Dataset(this, ds);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    // Range change callback (called by TradingVue)
    // TODO: improve (reliablity + chunk with limited size)
  }, {
    key: "range_changed",
    value: function () {
      var _range_changed = _asyncToGenerator(/*#__PURE__*/regenerator_default().mark(function _callee(range, tf, check) {
        var _this2 = this;
        var first, prom;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (check === void 0) {
                check = false;
              }
              if (this.loader) {
                _context.next = 3;
                break;
              }
              return _context.abrupt("return");
            case 3:
              if (this.loading) {
                _context.next = 19;
                break;
              }
              first = this.data.chart.data[0][0];
              if (!(range[0] < first)) {
                _context.next = 19;
                break;
              }
              this.loading = true;
              _context.next = 9;
              return utils.pause(250);
            case 9:
              // Load bigger chunks
              range = range.slice(); // copy
              range[0] = Math.floor(range[0]);
              range[1] = Math.floor(first);
              prom = this.loader(range, tf, function (d) {
                // Callback way
                _this2.chunk_loaded(d);
              });
              if (!(prom && prom.then)) {
                _context.next = 19;
                break;
              }
              _context.t0 = this;
              _context.next = 17;
              return prom;
            case 17:
              _context.t1 = _context.sent;
              _context.t0.chunk_loaded.call(_context.t0, _context.t1);
            case 19:
              if (!check) this.last_chunk = [range, tf];
            case 20:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function range_changed(_x, _x2, _x3) {
        return _range_changed.apply(this, arguments);
      }
      return range_changed;
    }() // A new chunk of data is loaded
    // TODO: bulletproof fetch
  }, {
    key: "chunk_loaded",
    value: function chunk_loaded(data) {
      // Updates only candlestick data, or
      if (Array.isArray(data)) {
        this.merge('chart.data', data);
      } else {
        // Bunch of overlays, including chart.data
        for (var k in data) {
          this.merge(k, data[k]);
        }
      }
      this.loading = false;
      if (this.last_chunk) {
        this.range_changed.apply(this, _toConsumableArray(this.last_chunk).concat([true]));
        this.last_chunk = null;
      }
    }

    // Update ids for all overlays
  }, {
    key: "update_ids",
    value: function update_ids() {
      this.data.chart.id = "chart.".concat(this.data.chart.type);
      var count = {};
      // grid_id,layer_id => DC id mapping
      this.gldc = {}, this.dcgl = {};
      var _iterator2 = dc_core_createForOfIteratorHelper(this.data.onchart),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ov = _step2.value;
          if (count[ov.type] === undefined) {
            count[ov.type] = 0;
          }
          var i = count[ov.type]++;
          ov.id = "onchart.".concat(ov.type).concat(i);
          if (!ov.name) ov.name = ov.type + " ".concat(i);
          if (!ov.settings) this.tv.$set(ov, 'settings', {});

          // grid_id,layer_id => DC id mapping
          this.gldc["g0_".concat(ov.type, "_").concat(i)] = ov.id;
          this.dcgl[ov.id] = "g0_".concat(ov.type, "_").concat(i);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      count = {};
      var grids = [{}];
      var gid = 0;
      var _iterator3 = dc_core_createForOfIteratorHelper(this.data.offchart),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ov = _step3.value;
          if (count[ov.type] === undefined) {
            count[ov.type] = 0;
          }
          var _i = count[ov.type]++;
          ov.id = "offchart.".concat(ov.type).concat(_i);
          if (!ov.name) ov.name = ov.type + " ".concat(_i);
          if (!ov.settings) this.tv.$set(ov, 'settings', {});

          // grid_id,layer_id => DC id mapping
          gid++;
          var rgid = (ov.grid || {}).id || gid; // real grid_id
          // When we merge grid, skip ++
          if ((ov.grid || {}).id) gid--;
          if (!grids[rgid]) grids[rgid] = {};
          if (grids[rgid][ov.type] === undefined) {
            grids[rgid][ov.type] = 0;
          }
          var ri = grids[rgid][ov.type]++;
          this.gldc["g".concat(rgid, "_").concat(ov.type, "_").concat(ri)] = ov.id;
          this.dcgl[ov.id] = "g".concat(rgid, "_").concat(ov.type, "_").concat(ri);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }

    // TODO: chart refine (from the exchange chart)
  }, {
    key: "update_candle",
    value: function update_candle(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var candle = data['candle'];
      var tf = this.tv.$refs.chart.interval_ms;
      var t_next = last[0] + tf;
      var now = data.t || utils.now();
      var t = now >= t_next ? now - now % tf : last[0];

      // Update the entire candle
      if (candle.length >= 6) {
        t = candle[0];
      } else {
        candle = [t].concat(_toConsumableArray(candle));
      }
      this.agg.push('ohlcv', candle);
      this.update_overlays(data, t, tf);
      return t >= t_next;
    }
  }, {
    key: "update_tick",
    value: function update_tick(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var tick = data['price'];
      var volume = data['volume'] || 0;
      var tf = this.tv.$refs.chart.interval_ms;
      if (!tf) {
        return console.warn('Define the main timeframe');
      }
      var now = data.t || utils.now();
      if (!last) last = [now - now % tf];
      var t_next = last[0] + tf;
      var t = now >= t_next ? now - now % tf : last[0];
      if ((t >= t_next || !ohlcv.length) && tick !== undefined) {
        // And new zero-height candle
        var nc = [t, tick, tick, tick, tick, volume];
        this.agg.push('ohlcv', nc, tf);
        ohlcv.push(nc);
        this.scroll_to(t);
      } else if (tick !== undefined) {
        // Update an existing one
        // TODO: make a separate class Sampler
        last[2] = Math.max(tick, last[2]);
        last[3] = Math.min(tick, last[3]);
        last[4] = tick;
        last[5] += volume;
        this.agg.push('ohlcv', last, tf);
      }
      this.update_overlays(data, t, tf);
      return t >= t_next;
    }

    // Updates all overlays with given values.
  }, {
    key: "update_overlays",
    value: function update_overlays(data, t, tf) {
      for (var k in data) {
        if (k === 'price' || k === 'volume' || k === 'candle' || k === 't') {
          continue;
        }
        if (k.includes('datasets.')) {
          this.agg.push(k, data[k], tf);
          continue;
        }
        if (!Array.isArray(data[k])) {
          var val = [data[k]];
        } else {
          val = data[k];
        }
        if (!k.includes('.data')) k += '.data';
        this.agg.push(k, [t].concat(_toConsumableArray(val)), tf);
      }
    }

    // Returns array of objects matching query.
    // Object contains { parent, index, value }
    // TODO: query caching
  }, {
    key: "get_by_query",
    value: function get_by_query(query, chuck) {
      var tuple = query.split('.');
      switch (tuple[0]) {
        case 'chart':
          var result = this.chart_as_piv(tuple);
          break;
        case 'onchart':
        case 'offchart':
          result = this.query_search(query, tuple);
          break;
        case 'datasets':
          result = this.query_search(query, tuple);
          var _iterator4 = dc_core_createForOfIteratorHelper(result),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var r = _step4.value;
              if (r.i === 'data') {
                r.v = this.dss[r.p.id].data();
              }
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
          break;
        default:
          /* Should get('.') return also the chart? */
          /*let ch = this.chart_as_query([
              'chart',
              tuple[1]
          ])*/
          var on = this.query_search(query, ['onchart', tuple[0], tuple[1]]);
          var off = this.query_search(query, ['offchart', tuple[0], tuple[1]]);
          result = [].concat(_toConsumableArray(on), _toConsumableArray(off));
          break;
      }
      return result.filter(function (x) {
        return !(x.v || {}).locked || chuck;
      });
    }
  }, {
    key: "chart_as_piv",
    value: function chart_as_piv(tuple) {
      var field = tuple[1];
      if (field) return [{
        p: this.data.chart,
        i: field,
        v: this.data.chart[field]
      }];else return [{
        p: this.data,
        i: 'chart',
        v: this.data.chart
      }];
    }
  }, {
    key: "query_search",
    value: function query_search(query, tuple) {
      var _this3 = this;
      var side = tuple[0];
      var path = tuple[1] || '';
      var field = tuple[2];
      var arr = this.data[side].filter(function (x) {
        return x.id === query || x.id && x.id.includes(path) || x.name === query || x.name && x.name.includes(path) || query.includes((x.settings || {}).$uuid);
      });
      if (field) {
        return arr.map(function (x) {
          return {
            p: x,
            i: field,
            v: x[field]
          };
        });
      }
      return arr.map(function (x, i) {
        return {
          p: _this3.data[side],
          i: _this3.data[side].indexOf(x),
          v: x
        };
      });
    }
  }, {
    key: "merge_objects",
    value: function merge_objects(obj, data, new_obj) {
      if (new_obj === void 0) {
        new_obj = {};
      }
      // The only way to get Vue to update all stuff
      // reactively is to create a brand new object.
      // TODO: Is there a simpler approach?
      Object.assign(new_obj, obj.v);
      Object.assign(new_obj, data);
      this.tv.$set(obj.p, obj.i, new_obj);
    }

    // Merge overlapping time series
  }, {
    key: "merge_ts",
    value: function merge_ts(obj, data) {
      // Assume that both arrays are pre-sorted

      if (!data.length) return obj.v;
      var r1 = [obj.v[0][0], obj.v[obj.v.length - 1][0]];
      var r2 = [data[0][0], data[data.length - 1][0]];

      // Overlap
      var o = [Math.max(r1[0], r2[0]), Math.min(r1[1], r2[1])];
      if (o[1] >= o[0]) {
        var _obj$v, _data;
        var _this$ts_overlap = this.ts_overlap(obj.v, data, o),
          od = _this$ts_overlap.od,
          d1 = _this$ts_overlap.d1,
          d2 = _this$ts_overlap.d2;
        (_obj$v = obj.v).splice.apply(_obj$v, _toConsumableArray(d1));
        (_data = data).splice.apply(_data, _toConsumableArray(d2));

        // Dst === Overlap === Src
        if (!obj.v.length && !data.length) {
          this.tv.$set(obj.p, obj.i, od);
          return obj.v;
        }

        // If src is totally contained in dst
        if (!data.length) {
          data = obj.v.splice(d1[0]);
        }

        // If dst is totally contained in src
        if (!obj.v.length) {
          obj.v = data.splice(d2[0]);
        }
        this.tv.$set(obj.p, obj.i, this.combine(obj.v, od, data));
      } else {
        this.tv.$set(obj.p, obj.i, this.combine(obj.v, [], data));
      }
      return obj.v;
    }

    // TODO: review performance, move to worker
  }, {
    key: "ts_overlap",
    value: function ts_overlap(arr1, arr2, range) {
      var t1 = range[0];
      var t2 = range[1];
      var ts = {}; // timestamp map

      var a1 = arr1.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      });
      var a2 = arr2.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      });

      // Indices of segments
      var id11 = arr1.indexOf(a1[0]);
      var id12 = arr1.indexOf(a1[a1.length - 1]);
      var id21 = arr2.indexOf(a2[0]);
      var id22 = arr2.indexOf(a2[a2.length - 1]);
      for (var i = 0; i < a1.length; i++) {
        ts[a1[i][0]] = a1[i];
      }
      for (var i = 0; i < a2.length; i++) {
        ts[a2[i][0]] = a2[i];
      }
      var ts_sorted = Object.keys(ts).sort();
      return {
        od: ts_sorted.map(function (x) {
          return ts[x];
        }),
        d1: [id11, id12 - id11 + 1],
        d2: [id21, id22 - id21 + 1]
      };
    }

    // Combine parts together:
    // (destination, overlap, source)
  }, {
    key: "combine",
    value: function combine(dst, o, src) {
      function last(arr) {
        return arr[arr.length - 1][0];
      }
      if (!dst.length) {
        dst = o;
        o = [];
      }
      if (!src.length) {
        src = o;
        o = [];
      }

      // The overlap right in the middle
      if (src[0][0] >= dst[0][0] && last(src) <= last(dst)) {
        return Object.assign(dst, o);

        // The overlap is on the right
      } else if (last(src) > last(dst)) {
        // Psh(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _dst;
          (_dst = dst).push.apply(_dst, _toConsumableArray(o).concat(_toConsumableArray(src)));
          return dst;
        } else {
          return dst.concat(o, src);
        }

        // The overlap is on the left
      } else if (src[0][0] < dst[0][0]) {
        // Push(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _src;
          (_src = src).push.apply(_src, _toConsumableArray(o).concat(_toConsumableArray(dst)));
          return src;
        } else {
          return src.concat(o, dst);
        }
      } else {
        return [];
      }
    }

    // Simple data-point merge (faster)
  }, {
    key: "fast_merge",
    value: function fast_merge(data, point, main) {
      if (main === void 0) {
        main = true;
      }
      if (!data) return;
      var last_t = (data[data.length - 1] || [])[0];
      var upd_t = point[0];
      if (!data.length || upd_t > last_t) {
        data.push(point);
        if (main && this.sett.auto_scroll) {
          this.scroll_to(upd_t);
        }
      } else if (upd_t === last_t) {
        if (main) {
          this.tv.$set(data, data.length - 1, point);
        } else {
          data[data.length - 1] = point;
        }
      }
    }
  }, {
    key: "scroll_to",
    value: function scroll_to(t) {
      if (this.tv.$refs.chart.cursor.locked) return;
      var last = this.tv.$refs.chart.last_candle;
      if (!last) return;
      var tl = last[0];
      var d = this.tv.getRange()[1] - tl;
      if (d > 0) this.tv["goto"](t + d);
    }
  }]);
}(DCEvents);

;// ./src/helpers/sett_proxy.js
// Sends all dc.sett changes to the web-worker

/* harmony default export */ function sett_proxy(sett, ww) {
  var h = {
    get: function get(sett, k) {
      return sett[k];
    },
    set: function set(sett, k, v) {
      sett[k] = v;
      ww.just('update-dc-settings', sett);
      return true;
    }
  };
  ww.just('update-dc-settings', sett);
  return new Proxy(sett, h);
}
;// ./src/helpers/agg_tool.js


// Tick aggregation


var AggTool = /*#__PURE__*/function () {
  function AggTool(dc, _int) {
    if (_int === void 0) {
      _int = 100;
    }
    classCallCheck_classCallCheck(this, AggTool);
    this.symbols = {};
    this["int"] = _int; // Itarval in ms
    this.dc = dc;
    this.st_id = null;
    this.data_changed = false;
  }
  return createClass_createClass(AggTool, [{
    key: "push",
    value: function push(sym, upd, tf) {
      var _this = this;
      // Start auto updates
      if (!this.st_id) {
        this.st_id = setTimeout(function () {
          return _this.update();
        });
      }
      tf = parseInt(tf);
      var old = this.symbols[sym];
      var t = utils.now();
      var isds = sym.includes('datasets.');
      this.data_changed = true;
      if (!old) {
        this.symbols[sym] = {
          upd: upd,
          t: t,
          data: []
        };
      } else if (upd[0] >= old.upd[0] + tf && !isds) {
        // Refine the previous data point
        this.refine(sym, old.upd.slice());
        this.symbols[sym] = {
          upd: upd,
          t: t,
          data: []
        };
      } else {
        // Tick updates the current
        this.symbols[sym].upd = upd;
        this.symbols[sym].t = t;
      }
      if (isds) {
        this.symbols[sym].data.push(upd);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;
      var out = {};
      for (var sym in this.symbols) {
        var upd = this.symbols[sym].upd;
        switch (sym) {
          case 'ohlcv':
            var data = this.dc.data.chart.data;
            this.dc.fast_merge(data, upd);
            out.ohlcv = data.slice(-2);
            break;
          default:
            if (sym.includes('datasets.')) {
              this.update_ds(sym, out);
              continue;
            }
            var data = this.dc.get_one("".concat(sym));
            if (!data) continue;
            this.dc.fast_merge(data, upd, false);
            break;
        }
      }
      // TODO: fill gaps
      if (this.data_changed) {
        this.dc.ww.just('update-data', out);
        this.data_changed = false;
      }
      setTimeout(function () {
        return _this2.update();
      }, this["int"]);
    }
  }, {
    key: "refine",
    value: function refine(sym, upd) {
      if (sym === 'ohlcv') {
        var data = this.dc.data.chart.data;
        this.dc.fast_merge(data, upd);
      } else {
        var data = this.dc.get_one("".concat(sym));
        if (!data) return;
        this.dc.fast_merge(data, upd, false);
      }
    }
  }, {
    key: "update_ds",
    value: function update_ds(sym, out) {
      var data = this.symbols[sym].data;
      if (data.length) {
        out[sym] = data;
        this.symbols[sym].data = [];
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.symbols = {};
    }
  }]);
}();

;// ./src/helpers/datacube.js






function datacube_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = datacube_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function datacube_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return datacube_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? datacube_arrayLikeToArray(r, a) : void 0; } }
function datacube_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function datacube_callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, datacube_isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function datacube_isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (datacube_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
// Main DataHelper class. A container for data,
// which works as a proxy and CRUD interface






// Interface methods. Private methods in dc_core.js
var DataCube = /*#__PURE__*/function (_DCCore) {
  function DataCube(data, sett) {
    var _this;
    if (data === void 0) {
      data = {};
    }
    if (sett === void 0) {
      sett = {};
    }
    classCallCheck_classCallCheck(this, DataCube);
    var def_sett = {
      aggregation: 100,
      // Update aggregation interval
      script_depth: 0,
      // 0 === Exec on all data
      auto_scroll: true,
      // Auto scroll to a new candle
      scripts: true,
      // Enable overlays scripts,
      ww_ram_limit: 0,
      // WebWorker RAM limit (MB)
      node_url: null,
      // Use node.js instead of WW
      shift_measure: true // Draw measurment shift+click
    };
    sett = Object.assign(def_sett, sett);
    _this = datacube_callSuper(this, DataCube);
    _this.sett = sett;
    _this.data = data;
    _this.sett = sett_proxy(sett, _this.ww);
    _this.agg = new AggTool(_this, sett.aggregation);
    _this.se_state = {};

    //this.agg.update = this.agg_update.bind(this)
    return _this;
  }

  // Add new overlay
  _inherits(DataCube, _DCCore);
  return createClass_createClass(DataCube, [{
    key: "add",
    value: function add(side, overlay) {
      if (side !== 'onchart' && side !== 'offchart' && side !== 'datasets') {
        return;
      }
      this.data[side].push(overlay);
      this.update_ids();
      return overlay.id;
    }

    // Get all objects matching the query
  }, {
    key: "get",
    value: function get(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      });
    }

    // Get first object matching the query
  }, {
    key: "get_one",
    value: function get_one(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      })[0];
    }

    // Set data (reactively)
  }, {
    key: "set",
    value: function set(query, data) {
      var objects = this.get_by_query(query);
      var _iterator = datacube_createForOfIteratorHelper(objects),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var obj = _step.value;
          var i = obj.i !== undefined ? obj.i : obj.p.indexOf(obj.v);
          if (i !== -1) {
            this.tv.$set(obj.p, i, data);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.update_ids();
    }

    // Merge object or array (reactively)
  }, {
    key: "merge",
    value: function merge(query, data) {
      var objects = this.get_by_query(query);
      var _iterator2 = datacube_createForOfIteratorHelper(objects),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var obj = _step2.value;
          if (Array.isArray(obj.v)) {
            if (!Array.isArray(data)) continue;
            // If array is a timeseries, merge it by timestamp
            // else merge by item index
            if (obj.v[0] && obj.v[0].length >= 2) {
              this.merge_ts(obj, data);
            } else {
              this.merge_objects(obj, data, []);
            }
          } else if (typeof_typeof(obj.v) === 'object') {
            this.merge_objects(obj, data);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.update_ids();
    }

    // Remove an overlay by query (id/type/name/...)
  }, {
    key: "del",
    value: function del(query) {
      var objects = this.get_by_query(query);
      var _iterator3 = datacube_createForOfIteratorHelper(objects),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var obj = _step3.value;
          // Find current index of the field (if not defined)
          var i = typeof obj.i !== 'number' ? obj.i : obj.p.indexOf(obj.v);
          if (i !== -1) {
            this.tv.$delete(obj.p, i);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.update_ids();
    }

    // Update/append data point, depending on timestamp
  }, {
    key: "update",
    value: function update(data) {
      if (data['candle']) {
        return this.update_candle(data);
      } else {
        return this.update_tick(data);
      }
    }

    // Lock overlays from being pulled by query_search
    // TODO: subject to review
  }, {
    key: "lock",
    value: function lock(query) {
      var objects = this.get_by_query(query);
      objects.forEach(function (x) {
        if (x.v && x.v.id && x.v.type) {
          x.v.locked = true;
        }
      });
    }

    // Unlock overlays from being pulled by query_search
    //
  }, {
    key: "unlock",
    value: function unlock(query) {
      var objects = this.get_by_query(query, true);
      objects.forEach(function (x) {
        if (x.v && x.v.id && x.v.type) {
          x.v.locked = false;
        }
      });
    }

    // Show indicator
  }, {
    key: "show",
    value: function show(query) {
      if (query === 'offchart' || query === 'onchart') {
        query += '.';
      } else if (query === '.') {
        query = '';
      }
      this.merge(query + '.settings', {
        display: true
      });
    }

    // Hide indicator
  }, {
    key: "hide",
    value: function hide(query) {
      if (query === 'offchart' || query === 'onchart') {
        query += '.';
      } else if (query === '.') {
        query = '';
      }
      this.merge(query + '.settings', {
        display: false
      });
    }

    // Set data loader callback
  }, {
    key: "onrange",
    value: function onrange(callback) {
      var _this2 = this;
      this.loader = callback;
      setTimeout(function () {
        return _this2.tv.set_loader(callback ? _this2 : null);
      }, 0);
    }
  }]);
}(DCCore);

;// ./src/mixins/interface.js
// Html interface, shown on top of the grid.
// Can be static (a tooltip) or interactive,
// e.g. a control panel.

/* harmony default export */ const mixins_interface = ({
  props: ['ux', 'updater', 'colors', 'wrapper'],
  mounted: function mounted() {
    this._$emit = this.$emit;
    this.$emit = this.custom_event;
    if (this.init) this.init();
  },
  methods: {
    close: function close() {
      this.$emit('custom-event', {
        event: 'close-interface',
        args: [this.$props.ux.uuid]
      });
    },
    // TODO: emit all the way to the uxlist
    // add apply the changes there
    modify: function modify(obj) {
      this.$emit('custom-event', {
        event: 'modify-interface',
        args: [this.$props.ux.uuid, obj]
      });
    },
    custom_event: function custom_event(event) {
      if (event.split(':')[0] === 'hook') return;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      this._$emit('custom-event', {
        event: event,
        args: args
      });
    }
  },
  computed: {
    overlay: function overlay() {
      return this.$props.ux.overlay;
    },
    layout: function layout() {
      return this.overlay.layout;
    },
    uxr: function uxr() {
      return this.$props.ux;
    }
  },
  data: function data() {
    return {};
  }
});
;// ./src/index.js















var primitives = {
  Candle: CandleExt,
  Volbar: VolbarExt,
  Line: Line,
  Pin: Pin,
  Price: Price,
  Ray: Ray,
  Seg: Seg
};
TradingVue.install = function (Vue) {
  Vue.component(TradingVue.name, TradingVue);
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(TradingVue);
  window.TradingVueLib = {
    TradingVue: TradingVue,
    Overlay: overlay,
    Utils: utils,
    Constants: constants,
    Candle: CandleExt,
    Volbar: VolbarExt,
    layout_cnv: layout_cnv,
    layout_vol: layout_vol,
    DataCube: DataCube,
    Tool: tool,
    Interface: mixins_interface,
    primitives: primitives
  };
}
/* harmony default export */ const src = (TradingVue);

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=trading-vue.js.map