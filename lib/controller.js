/**
 * The top controller
 * Process command-line arguments and interact with user
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
   * Display usage information
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
      default: 'yes',
    };
    var schema = {
      properties: {
        continueEmpty: continueEmpty,
      },
    };

    // Prompt and either continue or return based on res.cont
    prompt.start();
    prompt.get(schema, function(err, res) {
      if(err || res.continueEmpty == 'no') return;
      callback();  // In the case of yes
    });
  };
  
  /**
   * Output content to the location specified by argv.o
   * If no -o specified, stdout will be the destination
   */
  var _output = function(content, file) {
    if(file) {
      fs.writeFileSync(file, content);
      console.log('Result saved to: ' + file);
    } else {
      console.log(content);
    }
  };
  
  /**
   * Obtain OpenKIM data according to argv and present to user
   */
  var _get = function(argv) {
    // Lookup table for the options for model
    // Either abbr or fullname are acceptable
    var _modelOptions = {
      p: 'props',
      s: 'structs',
      e: 'elems',
      m: 'models',
      u: 'update',
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
    // Then, pass the data returned from model to view
    // Finally, output the result from view.render
    model.get(options, function(data) {
      _log.debug('data returned from model obtained');
      // Obtain the output according to the format specified
      var content = view.render(data, argv.format || argv.f);
      // Output data to appropriate location
      _output(content, argv.o);
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
      console.log('No options specified. Use \'-h\' to get usage information.');
      _verifyEmpty(function() {
        _get(argv);  // User confirms continue with default options
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
