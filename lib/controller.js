/**
 * The top controller
 * Process the command-line arguments and interacte with the user
 */

'use strict';

var fs = require('fs');
var path = require('path');
var prompt = require('prompt');
var common = require('./common.js');
var model = require('./model.js');
var view = require('./view.js');

var controller = (function() {
  
  // Cache common.log to local scope
  var _log = common.log;
  
  // Handle help option
  var _help = function() {
    // All the help information are saved in HELP_FILE
    var file = path.join(__dirname, '..', 'doc', common.C.HELP_FILE);
    var raw = fs.readFileSync(file, 'utf-8');
    console.log(raw);
  };

  // Handle empty argument case, ask the user whether to continue
  var _verifyEmpty = function(callback) {
    // Setup prompt schema for asking whether to continue or not
    var _desc = 'Continue with default options? (yes/no)'; 
    var _cont = {
      description: common.COLORS.yellow(_desc),
      type: 'string',
      pattern: /^(?:yes|no)$/,  // Must be either yes or no
      message: 'Please use \'yes\' or \'no\'',
      default: 'no',
    };
    var schema = {
      properties: {
        cont: _cont,
      },
    };

    // Prompt and either continue or return based on res.cont
    prompt.start();
    prompt.get(schema, function(err, res) {
      if(err || res.cont == 'no') return;
      callback();  // In the case of yes
    });
  };

  // Obtain OpenKIM data according to argv
  var _get = function(argv) {
    
    // Pass data from model to view and get output
    var _dataHandler = function(data) {
      _log.debug('data obtained');
      // Obtain the output according to the format specified in argv.f
      var output = view.render(data, argv.f);
      
      // Output to the file specified by argv.o, default to stdout
      if(argv.o) {
        fs.writeFileSync(argv.o, output);
        console.log('Result saved to: ' + argv.o);
      } else {
        console.log(output);
      }

    };
    
    // Lookup table for the options for model
    // Either abbr or fullname are acceptable
    // When both are present, the full name overwrites the abbreviation
    var _modelOpts = {
      p: 'props',
      s: 'structs',
      e: 'elems',
      m: 'models',
      n: 'newest',
      c: 'cache',
    };
    
    // Pack all options into_options object
    var _options = {};
    for(var abbr in _modelOpts) {
      var fullname = _modelOpts[abbr];
      _options[fullname] = argv[fullname] || argv[abbr];
    }
    // Pass options and data handler to model
    // dataHandler renders and outputs the data from model
    _log.debug('model options:\n' + JSON.stringify(_options, null, 2));
    model.get(_options, _dataHandler);
    
  };

  // Process the arguments
  var _process = function(argv) {
    common.log.debug('argv: ' + JSON.stringify(argv));
    
    // When h or help is true, call _help and ignore other arguments
    if(argv.h || argv.help) {
      _help();
      return;
    }
    
    // When there is no arguments, ask the user to verify whether to continue
    if(Object.keys(argv).length == 1 && argv._.length == 0) {
      console.log('No options specified. Use \'-h\' to see help information');
      _verifyEmpty(function() {
        // Continue to retrieve data
        _get(argv);
      });
      return;
    }

    // Get OpenKIM data
    _get(argv);
  };

  return {
    process: _process,
  };
})();

module.exports = controller;
