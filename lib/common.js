/**
 * Configurations, constants, and commonly used functions
 */

'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var colors = require('colors/safe');
var log = new (require('log'))('debug');
var _ = require('underscore');

module.exports = (function() {
  // Initialize common as an empty object
  var common = {};
  
  // Configurations
  common.conf = {
    HELP_FILE: 'help.txt',  // help information
    CACHE_FILE: 'cache.json',  // cache data from OpenKIM
    API_URL: 'https://query.openkim.org/api',  // OpenKIM Query API
  };
  
  // Properties and structures
  common.PROP_META = (function() {
    // Obtain initial propMeta from some file
    var propMetaFile = path.join(__dirname, 'prop_meta.json');
    var propMeta = JSON.parse(fs.readFileSync(propMetaFile, 'utf-8')); 
    // Add two more commonly used keys
    Object.keys(propMeta).forEach(function(prop) {
      var propKey = propMeta[prop]['property-key'];
      _.extend(propMeta[prop], {
        'value-key': propKey + '.source-value',
        'uncert-key': propKey + '.source-std-uncert-value',
      });
    });
    
    return propMeta;
  })();
  common.PROPS = Object.keys(common.PROP_META);
  common.STRUCTS = ['fcc', 'bcc', 'sc', 'diamond', 'hcp'];
   
  // Colors for command-line output
  common.COLORS = colors;
  
  // Handle logs
  common.log = log;

  // Handle errors
  common.Error = (function() {
    // The error class of this package
    var KimQueryError = function(msg) {
      var msg = util.format.apply(this, arguments);
      msg += '\nUse \'kimquery -h\' to get usage information.';
      this.message = msg;
      this.name = 'KimQueryError';
      log.error(msg);
    };
    // Setup prototype and constructor chain
    KimQueryError.prototype = Object.create(Error.prototype);
    KimQueryError.prototype.contructor = KimQueryError;
    
    return KimQueryError;
  })();

  // Get the elements in B that do not belong to A
  common.getOutliers = function(A, B) {
    var ret = [];
    B.forEach(function(b) {
      if(A.indexOf(b) == -1) {
        ret.push(b);
      }
    });
    return ret;
  };

  return common;

})();
