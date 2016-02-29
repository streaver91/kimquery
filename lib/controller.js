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
  
  // Cache log and conf to local scope
  var _log = common.log;
  var _conf = common.conf;
  
  /**
   * Handle help option
   */
  var _help = function() {
    // All the help information are saved in HELP_FILE
    var file = path.join(__dirname, '..', 'doc', _conf.HELP_FILE);
    var raw = fs.readFileSync(file, 'utf-8');
    console.log(raw);
  };

  /**
   * Handle empty argument case, ask the user whether to continue
   */
  var _verifyEmpty = function(callback) {
    // Setup prompt schema for asking whether to continue or not
    var description = 'Continue with default options? (yes/no)'; 
    var continueEmpty = {
      description: common.COLORS.yellow(description),
      type: 'string',
      pattern: /^(?:yes|no)$/,  // Must be either yes or no
      message: 'Please use \'yes\' or \'no\'',
      default: 'no',
    };
    var schema = {
      properties: {
        continueEmpty: continueEmpty,
      },
    };

    // Prompt and either continue or return based on res.cont
    prompt.start();
    prompt.get(schema, function(err, res) {
      if(err || res.cont == 'no') return;
      callback();  // In the case of yes
    });
  };
  
  /**
   * Output data to the location specified by argv.o
   * If no -o specified, stdout will be the destination
   */
  var _output = function(data) {
    if(argv.o) {
      fs.writeFileSync(argv.o, output);
      console.log('Result saved to: ' + argv.o);
    } else {
      console.log(output);
    }
  };

  /**
   * Obtain OpenKIM data according to argv and present to user
   */
  var _get = function(argv) {
    // Lookup table for the options for model
    // Either abbr or fullname are acceptable
    // When both are present, the full name overwrites the abbreviation
    var _modelOptions = {
      p: 'props',
      s: 'structs',
      e: 'elems',
      m: 'models',
      n: 'newest',
      c: 'cache',
    };
    
    // Pack all options into_options object
    var options = {};
    for(var abbr in _modelOptions) {
      var fullname = _modelOptions[abbr];
      // Push argv to _options, give higher priority to fullname options
      options[fullname] = argv[fullname] || argv[abbr]; 
    }
    
    // Pass options to model
    // Handle the data returned from model to view
    // Finally, output the result from view.render
    _log.debug('model options:\n' + JSON.stringify(options, null, 2));
    model.get(options, function(data) {
      _log.debug('data for output obtained');
      // Obtain the output according to the format specified in argv.f
      var output = view.render(data, argv.f);
      // Output data to appropriate location
      _output(output);
    });
    
  };

  /**
   * Process the arguments
   */
  var _process = function(argv) {
    _log.debug('argv:\n' + JSON.stringify(argv, null, 2));
    
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
