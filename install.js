#!/usr/bin/env node

var fs          = require('fs')
  , path        = require('path')
  , installNpm  = require('./install-npm.js')
  , installYarn = require('./install-yarn.js')

  , rootPath    = path.resolve(__dirname, '..', '..')

  , envLabel    = 'install_peers_skip'
  ;

// in npm@3+ preinstall happens in `node_modules/.staging` folder
// so if we ended up in `node_modules/` jump one level up
if (path.basename(rootPath) === 'node_modules') {
  rootPath = path.resolve(rootPath, '..');
}

installPeerDeps();

// --- Subroutines

function installPeerDeps() {
  var argv;

  // only run on `install`
  if (process.env['npm_config_argv']) {
    argv = JSON.parse(process.env['npm_config_argv']);
    if (argv && argv['cooked'][0] !== 'install') {
      console.log('Only run install-peer-deps after `install` command. Skipping.');
      return;
    }
  }

  // check for the "kill switch"
  if (process.env[envLabel]) {
    console.log('Only run install-peer-deps once. Skipping.');
    return;
  }

  // yo, do not install peers while installing peers
  process.env[envLabel] = '1';

  getPackageConfig(rootPath, function(config) {
    var peerDeps = getPeerDeps(config);

    if (!peerDeps || !peerDeps.length) {
      console.error('Unable to find peerDependencies in ' + rootPath);
      return;
    }

    // ready to install, switch directories
    process.chdir(rootPath);

    // TODO: Add more alternatives
    if (installYarn) {
      installYarn(peerDeps, config, installDone.bind(null, 'yarn', peerDeps.length));
    } else if (installNpm) {
      installNpm(peerDeps, config, installDone.bind(null, 'npm', peerDeps.length));
    }
  });
}

function installDone(tool, packagesNum, result) {

  // cleanup env
  process.env[envLabel] = '';

  // Summary
  console.log('+ Successfully installed ' + packagesNum + ' peerDependencies via ' + tool + '.\n');

  // Verbose
  console.log(result);
}

function getPeerDeps(config) {
  var peerDeps;

  if (typeof config.peerDependencies === 'object' && !Array.isArray(config.peerDependencies)) {
    peerDeps = Object.keys(config.peerDependencies).map(function(name) {
      return name + '@' + config.peerDependencies[name];
    });
  }

  return peerDeps;
}

function getPackageConfig(packagePath, callback) {
  var packageFile = path.join(packagePath, 'package.json')
    , config
    ;

  fs.readFile(packageFile, 'utf-8', function(error, content) {
    if (error || !content) {
      console.error('Unable to read ' + packageFile + ':', error || 'no content');
      return;
    }

    config = parseConfig(content);

    if (config.isParseConfigFailed) {
      console.error('Unable to parse ' + packageFile + ':', config.error);
      return;
    }

    callback(config);
  });
}

function parseConfig(config) {
  try {
      config = JSON.parse(config);
  } catch (error) {
      config = {isParseConfigFailed: true, error: error};
  }

  return config;
}
