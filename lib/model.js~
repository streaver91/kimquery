/**
 * retrieve data from OpenKIM
 */

'use strict';

var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var needle = require('needle');
var common = require('./common.js');

querystring.escape = function(str) {
  return str;  // No escape
};

var model = (function() {
  var _data = {};  // Cache temporary data
  var _props = common.PROPS;  // Default to all properties
  var _structs = common.STRUCTS;  // Default to all structures
  var _elems = undefined;
  var _models = undefined;
  var _newest = false;  // Whether obtain newest and update cache
  var _cache = path.join(__dirname, _config.C.CACHE_FILE);  // Cache file
  
  // Cache common.log to local scope
  var _log = common.log;
  
  /** 
   * Validate options and save to local variables
   */
  var _init = function(options) {{
    // Process props
    (function(props) {
      if(props == undefined) return;
      if(typeof props != common.C.STRING) {
        throw new common.Error('No properties specified.');
      }
      props = props.split(',');
      var outliers = common.getOutliers(common.PROPS, props);
      if(outliers.length > 0) {
        throw new common.Error('Unrecognized property(s): %s.', outliers);
      }
      _props = props;
    })(options.props);
    
    // Process structs
    (function(structs) {
      if(structs == undefined) return;
      if(typeof structs != common.C.STRING) {
        throw new common.Error('No structures specified.');
      }
      structs = structs.split(',');
      var outliers = common.getOutliers(common.STRUCTS, structs);
      if(outliers.length > 0) {
        throw new common.Error('Unrecognized structure(s): %s.', outliers);
      }
      _structs = structs;
    })(options.structs);

    // Process elems
    (function(elems) {
      if(elems == undefined) return;
      if(typeof elems != common.C.STRING) {
        throw new common.Error('No elements specified.');
      }
      elems = elems.split(',');
      elems.forEach(function(elem) {
        if(!/[A-Z][a-z]?/.test(elem)) {
          throw new common.Error('Invalid element: %s.', elem);
        }
      });
      _elems = elems;
    })(options.elems);

    // Process models
    (function(models) {
      if(models == undefined) return;
      if(typeof models != common.C.STRING) {
        throw new common.Error('No models specified.');
      }
      models = models.split(',');
      models.forEach(function(model) {
        if(!/\w+\__MO_\d{12}_\d{3}/.test(model)) {
          throw new common.Error('Invalid model: %s.', model);
        }
      });
      _models = models;
    })(options.models);

    // Process newest
    (function(newest) {
      if(newest == undefined) return;
      if(typeof newest != common.C.BOOL) {
        throw new common.Error('Invalid usage of newest (-n).');
      }
      _newest = newest;
    })(options.newest);

    // Process cache
    (function(cache) {
      if(cache == undefined) return;
      if(typeof cache != common.C.STRING) {
        throw new common.Error('No cache file specified.');
      }
      _cache = cache;
    })(options.cache);
  };
  
  /**
   * Get query according to the prop and struct specified
   */
  var _getQuery = function(prop, struct, meta, callback) {
    var query = {
      'meta.type': 'tr',
      'property-id': meta['property-id'],
      'meta.runner.kimcode': {
        '$regex': '^' + meta['test-driver'] + '_' + struct,
      },
    };
    var fields = {
      'meta.model': 1,
      'meta.runner.species': 1,
      'host-short-name.source-value': 1,
    };
    fields[meta['value-key']] = 1;
    fields[meta['uncert-key']] = 1;
    var query = {
      flat: 'on',
      query: JSON.stringify(query),
      limit: 0,
      fields: JSON.stringify(fields),
      database: 'data',
    }
    var url = _config.API_URL + '?' + querystring.stringify(query);
    console.log('Retrieving %s of %s crystals...', prop, struct);
    _log.debug('  URL: %s', url);
    needle.get(url, _resHandler(prop, struct, meta, callback));
  };
  /**
   * Update data and cache
   */
  var _update = function() {

  };
  
  var _get = function(options, dataHandler) {
    _readOpts(options);
    console.dir(options);
    dataHandler(_data);
  };
  
  return {
    get: _get,
  };
})();

module.exports = model;
