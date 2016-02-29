/**
 * This module contains commonly used constants and functions
 */

'use strict';

var colors = require('colors/safe');
var log = new (require('log'))('debug');
var _ = require('underscore');

(function(exports) {
  // Initialize common as an empty object
  var common = {};
  
  // Configurations
  common.conf = {
    HELP_FILE: 'help.txt',  // help information
    CACHE_FILE: 'cache.json',  // cache data from OpenKIM
    ERROR_SUFFIX: '\nYou can use \'kimquery -h\' to get help information.', 
    UNCERT_SUFFIX: '_std',  // suffix after colume name for uncertainty 
  };
  
  // Properties and structures
  common.PROP_META = {
    "vfe": {
      "property-id": "tag:staff@noreply.openkim.org,2015-07-28:property/monovacancy-neutral-relaxed-formation-potential-energy-crystal-npt",
      "test-driver": "VacancyFormationMigration",
      "property-key": "relaxed-formation-potential-energy"
    },
    "vme": {
      "property-id": "tag:staff@noreply.openkim.org,2015-09-16:property/monovacancy-neutral-migration-energy-crystal-npt",
      "test-driver": "VacancyFormationMigration",
      "property-key": "vacancy-migration-energy"
    },
    "vrv": {
      "property-id": "tag:staff@noreply.openkim.org,2015-07-28:property/monovacancy-neutral-relaxation-volume-crystal-npt",
      "test-driver": "VacancyFormationEnergyRelaxationVolume",
      "property-key": "relaxation-volume"
    },
  };
  (function(PROP_META) {
    Object.keys(PROP_META).forEach(function(prop) {
      var propKey = PROP_META[prop];
      _.extend(PROP_META[prop], {
        'value-key': propKey + '.source-value',
        'uncert-key': propKey + '.source-std-uncert-value',
      });
    });
  })(common.PROP_META);
  common.PROPS = Object.keys(common.PROP_META);
  common.STRUCTS = ['fcc', 'bcc', 'sc', 'diamond', 'hcp'];
   
  // Colors for command-line output
  common.COLORS = colors;
  
  // Handle logs
  common.log = log;

  // Handle errors
  var KimQueryError = function(msg) {
    var msg = format.util.apply(this, arguments);
    this.message = msg + common.C.ERROR_SUFFIX;
    this.name = 'KimQueryError';
    common.log.error(msg);
  };
  KimQueryError.prototype = Object.create(Error.prototype);
  KimQueryError.prototype.contructor = KimQueryError;
  common.Error = KimQueryError;

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

  // Expose common to the module user
  exports = common;

})(module.exports);
