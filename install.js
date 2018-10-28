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

  // check for the "kill switch"
  if (process.env[envLabel]) {
    console.log('Skipping installing peerDependencies.');
    return;
  }

  // yo, do not install peers while installing peers
  process.env[envLabel] = '1';

  getPackageConfig(rootPath, function(config) {
    var peerDeps = getPeerDeps(config);

    if (!peerDeps) {
      console.error('Unable to find peerDependencies in ' + rootPath);
      return;
    }

    // ready to install, switch directories
    process.chdir(rootPath);

    // TODO: Add more alternatives
    if (installYarn) {
      installYarn(peerDeps, installDone.bind(null, 'yarn'));
    } else if (installNpm) {
      installNpm(peerDeps, installDone.bind(null, 'npm'));
    }
  });
}

function installDone(tool) {

  // cleanup env
  process.env[envLabel] = '';

  console.log('Installed peerDependencies via ' + tool + '.');
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
