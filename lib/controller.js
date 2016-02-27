/**
 * Exports controller for handling command-line arguments
 */

'use strict';

var path = require('path');
var fs = require('fs');
var colors = require('colors/safe');
var prompt = require('prompt');
var log = new (require('log'))('debug');
var config = require('./config.js');
var model = require('./model.js');
var view = require('./view.js');

/**
 * Process command-line arguments
 */
var controller = (function() {
  // Handle help option
  var _help = function() {
    var file = path.join(__dirname, '..', 'doc', config.HELP_FILE);
    var raw = fs.readFileSync(file, 'utf-8');
    console.log(raw);
  };

  // Handle empty argument case, ask the user whether to continue
  var _verifyEmpty = function(callback) {
    // Setup prompt schema for asking whether to continue or not
    var _desc = 'Continue with default options? (yes/no)'; 
    var _cont = {
      description: colors.yellow(_desc),
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
      callback();
    });
  };

  // Obtain OpenKIM data according to argv
  var _get = function(argv) {
    // Handle data obtained by model, and render with view, and output
    var _dataHandler = function(data) {
      // Obtain the output according to the format specified in argv.f
      var output = view.present(data, argv.f);
      
      // Output to the file specified by argv.o, default to stdout
      if(argv.o) {
        fs.writeFileSync(argv.o, output);
        console.log('Result saved to: ' + argv.o);
      } else {
        console.log(output);
      }

    };

    // Get data and call callback when completed
    var _options = {
      props: argv.p.split(',') || Object.keys(config.PROPS),
      structs: argv.s.split(',') || config.STRUCTS,
      elems: argv.e.split(','),
      models: argv.m,
      newest: argv.n || false,

    };

    model.get(_options, _dataHandler);
    
  };

  // Process the arguments
  var _process = function(argv) {
    log.debug('argv: ' + JSON.stringify(argv));

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
});

module.exports = controller;
