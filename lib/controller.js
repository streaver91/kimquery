var prompt = require('prompt');
var log = new (require('log'))('debug');
var path = require('path');
var fs = require('fs');
var config = require('./config.js');

var _help = function() {
  var file = path.join(__dirname, '..', 'doc', config.HELP_FILE);
  var raw = fs.readFileSync(file, 'utf-8');
  console.log(raw);
};

var _process = function(argv) {
  log.debug('argv: ' + JSON.stringify(argv, null, 2));
  if(argv.h || argv.help) {
    _help();
    return;
  }
  if(Object.keys(argv).length == 1 && argv._.length == 0) {
    console.log('No options specified. Use \'-h\' to see help information');
    console.log('Continue with default options? (yes/[no])');
    prompt.get(['default'], function(err, res) {
      if(err || res.default != 'yes') return;
      _get(argv);
    });
    return;
  }
  _get(argv);
};

var controller = {
  process: _process,
};

module.exports = controller;
