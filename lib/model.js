/**
 * retrieve data from OpenKIM
 */

'use strict';

var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var needle = require('needle');
var _ = require('underscore');
var common = require('./common.js');

querystring.escape = function(str) {
  return str;  // No escape
};

var model = (function() {
  
  // Cache conf and log to local scope
  var _conf = common.conf;
  var _log = common.log;
  
  var _data = {};  // Cache temporary data
  
  // Options for model
  var _props = common.PROPS;  // Default to all properties
  var _structs = common.STRUCTS;  // Default to all structures
  var _elems = undefined;
  var _models = undefined;
  var _newest = false;  // Whether obtain newest and update cache
  var _cache = path.join(__dirname, _conf.CACHE_FILE);  // Cache file
  
  /**
   * Initialization
   */
  var _init = function(options, callback) {
    _processOptions();
    _data = JSON.parse(fs.readFileSync(_cache, 'utf-8');  // Get data from cache
    // If user want the most recent version, get it from OpenKIM
    if(_newest) {
      _update(function() {
        // Save to cache file and continue
        fs.writeFileSync(_cache, JSON.stringify(_data, null, 2));
        callback();
      });
    } else {
      callback();
    }
  };

  /** 
   * Validate options and save to local variables
   */
  var _processOptions = function(options) {{
    // Process props
    (function(props) {
      if(props == undefined) return;
      if(typeof props != 'string') {
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
      if(typeof structs != 'string') {
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
      if(typeof elems != 'string') {
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
      if(typeof models != 'string') {
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
      if(typeof newest != 'boolean') {
        throw new common.Error('Invalid usage of newest (-n).');
      }
      _newest = newest;
    })(options.newest);

    // Process cache
    (function(cache) {
      if(cache == undefined) return;
      if(typeof cache != 'string') {
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
    _log.debug('URL: %s', url);
    needle.get(url, _resHandler(prop, struct, meta, callback));
  };
  
  /**
   * Extract data from response and save to _data
   * Called by _getQuery()
   */
  var _resHandler = function(prop, struct, meta, callback) {
    // Pack information into the closure
    return function(err, res) {
      if(!err && res.statusCode == 200) {
        var body = res.body;
        var tmpData = {};  // Object to be stored at _data[prop][struct]
        for(var i = 0; i < body.length; i++) {
          var item = body[i];
          var value = item[meta['value-key']];
          var uncert = item[meta['uncert-key']];
          var model = item['meta.model'];
          var elem = item['meta.runner.species'];
          tmpData[elem] = tmpData[elem] || {};
          tmpData[elem][model] = {
            value: value,
            uncert: uncert,
          };
        }
        _data[prop] = _data[prop] || {};
        _data[prop][struct] = tmpData;
        callback();
      } else {
        if(meta.retries == 0) {
          throw new common.Error('Failed to obtain %s in %s.', prop, struct);
        }
        var interval = _conf.RETRY_INTERVAL;
        console.log('Warning: Failed to get data. Retry after %d s...', interval);
        setTimeout(function() {
          meta.retries--;
          _getQuery(prop, struct, meta, callback);
        }, 1000 * interval);
      }
    };
  };

  /**
   * Obtain newest data from OpenKIM and update _data
   */
  var _update = function(callback) {
    var tasks = [];
    for(var i = 0; i < props.length; i++) {
      for(var j = 0; j < structs.length; j++) {
        tasks.push({
          prop: props[i],
          struct: structs[j],
        });
      }
    }
    
    // Update one by one to avoid being mistaken for DDOS
    var performTask = function(taskId) {
      // If the last task has finished, call the callback function
      if(taskId == tasks.length) {
        callback();
        return;
      }
      var task = tasks[taskId];
      var meta = _.clone(_conf.PROP_META[task.prop]);  // Obtain a copy of meta
      meta.retries = 3;
      _getQuery(task.prop, task.struct, meta, function() {
        setTimeout(function() {
          performTask(id + 1);
        }, 1000);
      });
    };
    performTask(0);
  };
 
  /**
   * Function to be exposed to controller
   * Generate and pass data to dataHandler according to the options specified
   */
  var _get = function(options, dataHandler) {
    _init(options, function() {
      // Copy _data, filter out unwanted items, and pass to dataHandler
      var tmpData = _.clone(_data);
      tmpData = _filter(tmpData);
      dataHanderl(tmpData);
    });
  };
  
  return {
    get: _get,
  };
})();

module.exports = model;
