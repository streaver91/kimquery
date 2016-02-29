#!/usr/bin/env node
/*!
 * kimquery - CLI for retrieving data from OpenKIM 
 */

'use strict';

// Parse command-line inputs
var argv = require('minimist')(process.argv.slice(2));

// Process the inputs with controller
var controller = require('../lib/controller.js');
controller.process(argv);
