#!/usr/bin/env node
/*!
 * kimquery - CLI for retrieving data from OpenKIM 
 */

'use strict';

// Use controller to handle command line inputs
var controller = require('../lib/controller.js');
var argv = require('minimist')(process.argv.slice(2));
controller.process(argv);
