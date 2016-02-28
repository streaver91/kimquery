/**
 * retrieve data from OpenKIM according to the query parameters
 */

'use strict';

var model = (function() {
  var _data = {};

  var _get = function(options, dataHandler) {
    console.log('model.get');
    console.dir(options);
    dataHandler(_data);
  };
  
  return {
    get: _get,
  };
})();

module.exports = model;
