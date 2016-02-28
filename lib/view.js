/**
 * This module converts data to corresponding format
 */

'use strict';

var config = require('./config');

var view = (function() {
  // Convert data to csv format
  var _getCSV = function(data, showUncert) {
    
    // Pack data into 2d object table:
    // 1st dim: prop#struct
    // 2nd dim: elem#model
    var table = {};
    
    // title will be the the first line in the output
    var title = ['elem', 'model'];
    var cols = [];  // Corresponds to 1st dim in table
    
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
        
        // Cache reference to data[prop][struct]
        var chunk = data[prop][struct];
        
        // Define col name as prop#struct
        var col = [prop, struct].join('#');
        
        // Push col into title and cols
        cols.push(col);
        title.push(col);
        title.push(col + common.C.UNCERT_SUFFIX);  // For uncertainty
        
        // Pack each chunk
        for(var elem in chunk) {
          for(var model in chunk[elem]) {
            // key corresponds to the 1st dim in the table
            var key = [elem, model].join('#');
            if(table[_key] == undefined) {
              table[_key] = {};  // Avoid property undefined error
            }
            table[key][col] = chunk[elem][model];
          }
        }
      }
    }
    
    // Generate output from table
    var output = [title.join(',')];
    for(var key in table) {
      // key is the primary key of each row, presented as elem#model
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
    var _ret;
    if(format == 'json') {
      _ret = JSON.stringify(data, null, 2);
    } else if(format == 'csv') {
      _ret = _getCSV(data);
    } else {
      // Maybe something currently not supported
      throw new c.Error('Output format not supported.');
    }
    return _ret;
  };
  
  return {
    render: _render,
  };
  
})();

module.exports = view;
