#!/usr/bin/env node

var controller = require('../lib/controller.js');
var argv = require('minimist')(process.argv.slice(2));
controller.process(argv);
