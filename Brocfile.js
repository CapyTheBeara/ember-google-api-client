/* global require, process */
'use strict';

var name = require('./package.json').name;
var path = require('path');
var env = process.env.EMBER_ENV;
var dist = env === 'dist';

var pickFiles   = require('broccoli-static-compiler');
var compileES6  = require('broccoli-es6-concatenator');
var findBowerTrees   = require('broccoli-bower');
var mergeTrees  = require('broccoli-merge-trees');

var lib = pickFiles('lib', {
  srcDir: '/',
  destDir: name
});

if (dist) {
  var loader = pickFiles('vendor', {
    srcDir: '/loader',
    files: ['loader.js'],
    destDir: '/loader'
  });

  var scripts = mergeTrees([lib, loader], { overwrite: true });

  var es6 = compileES6(scripts, {
    loaderFile: 'loader/loader.js',
    inputFiles: [name + '/**/*.js'],
    outputFile: '/index.js'
  });

  return module.exports = es6;
}

var index = pickFiles('tests', {
  srcDir: '/',
  files: ['index.html'],
  destDir: '/'
});

var tests = pickFiles('tests', {
  srcDir: '/',
  destDir: name + '/tests'
});

var sourceFiles = [lib, tests, 'vendor'].concat(findBowerTrees());
var scripts = mergeTrees(sourceFiles, { overwrite: true });

var ignoredModules = [
  'ember',
  'ember/resolver',
  'ic-ajax'
];

var legacyFilesToAppend = [
    'jquery.js',
    'handlebars.js',
    'ember.js',
    'ic-ajax/dist/named-amd/main.js',
    'ember-data.js',
    'app-shims.js',
    'ember-resolver.js'
  ];

var qunit = require('broctree-qunit');

var testem = pickFiles('tests', {
  files: ['testem.js'],
  srcDir: 'helpers',
  destDir: '/'
});

var es6 = compileES6(scripts, {
  loaderFile: 'loader/loader.js',
  ignoredModules: ignoredModules,
  inputFiles: [name + '/**/*.js'],
  wrapInEval: true,
  outputFile: '/index.js',
  legacyFilesToAppend: legacyFilesToAppend
});

return module.exports = mergeTrees([index, es6, qunit, testem], { overwrite: true});
