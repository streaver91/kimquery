/**
 * This module converts data to corresponding format
 */

'use strict';

var common = require('./common.js');

var view = (function() {

  // Cache conf and log to local
  var _conf = common.conf;
  var _log = common.log;
  
  /**
   * Convert data to csv format
   */
  var _getCSV = function(data) {
    
    // Pack 4d data into 2d table:
    // col dim: prop#struct
    // row dim: elem#model
    var table = {};
    
    // title will be the the first line in the output
    var title = ['elem', 'model'];
    var cols = [];
    
    // Start packing into table
    for(var prop in data) {
      // Check whether prop is in common.PROPS
      if(common.PROPS.indexOf(prop) == -1) {
        throw new common.Error('Property not recognized.');
      }
      
      for(var struct in data[prop]) {
        // Check whether struct is in common.STRUCTS
        if(common.STRUCTS.indexOf(struct) == -1) {
          throw new common.Error('Structure not recognized.');
        }
        
        // Cache the reference to data[prop][struct]
        var chunk = data[prop][struct];
        
        // Define col name as prop#struct
        var col = [prop, struct].join('#');
        
        // Push col into title and cols
        cols.push(col);
        title.push(col);
        title.push(col + _conf.UNCERT_SUFFIX);  // For uncertainty
        
        // Pack each chunk into table
        for(var elem in chunk) {
          for(var model in chunk[elem]) {
            // key corresponds to the row dim of the table
            var key = [elem, model].join('#');
            if(table[key] == undefined) {
              table[key] = {};  // Avoid property undefined error
            }
            table[key][col] = chunk[elem][model];
          }
        }
      }
    }
    
    // Generate output from table
    var output = [title.join(',')];  // First line contains title
    for(var key in table) {
      // key is the primary key of each row, represented as elem#model
      var row = key.split('#');  // The first two cols are elem and model
      for(var i = 0; i < cols.length; i++) {
        var col = cols[i];
        var tmpRes = table[key][col];
        if(tmpRes == undefined) {
          // If not available, output '-'
          tmpRes = {
            value: '-',
            uncert: '-',
          };
        }
        row.push(tmpRes.value);
        row.push(tmpRes.uncert);
      }
      output.push(row.join(','));
    }
    return output.join('\n');
  };
  
  // Render data according to the format
  var _render = function(data, format) {
    format = format || 'json';
    var content;
    if(format == 'json') {
      content = JSON.stringify(data, null, 2);
    } else if(format == 'csv') {
      content = _getCSV(data);
    } else {
      // Currently not supported
      throw new common.Error('Output format \'%s\' is not supported.', format);
    }
    return content;
  };
  
  return {
    render: _render,
  };
  
})();

module.exports = view;
