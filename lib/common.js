/**
 * This module contains commonly used constants and functions
 */

'use strict';

var colors = require('colors/safe');
var log = new (require('log'))('debug');

(function(exports) {
  // Initialize c (common) as an empty object
  var c = {};

  // Constants
  c.C = {
    HELP_FILE: 'help.txt',  // help information
    ERROR_SUFFIX: '\nYou can use \'kimquery -h\' to see help information.', 
    UNCERT_SUFFIX: '_std',  // suffix after colume name for uncertainty 
    OBJECT: 'object',
    ARRAY: 'array',
  };
 
  // Colors for command-line output
  c.COLORS = colors;
  
  // Handle logs
  c.log = log;

  // Handle errors
  var KimQueryError = function(msg) {
    this.message = msg + c.C.ERROR_SUFFIX;
    this.name = 'KimQueryError';
    c.log.error(msg);
  };
  KimQueryError.prototype = Object.create(Error.prototype);
  KimQueryError.prototype.contructor = KimQueryError;
  c.Error = KimQueryError;

  // Expose common to the module user
  exports = c;

})(module.exports);
