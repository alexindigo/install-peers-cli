// do it inline in sync way
// to make it work in non-npm environment
var yarnBin
  , executioner
  , path = require('path')
  , node = process.argv[0]
  ;

if (process.env['npm_execpath'] && process.env['npm_execpath'].match(/\/bin\/yarn\.js$/)) {
  yarnBin = path.resolve(process.env['npm_execpath']);
}

// if no yarn module found, don't expose any function
// to allow upstream modules find alternatives
module.exports = null;

if (yarnBin) {

  executioner = require('executioner');

  module.exports = function(packages, config, done) {

    var ignoreWorkspaceRootCheck = '';
    var originalArgv;

    // adjust for workspace support
    if (config.workspaces) {
      ignoreWorkspaceRootCheck = '--ignore-workspace-root-check';
    }

    var options = {
      node    : node,
      yarn    : yarnBin,
      // escape package names@versions
      packages: packages.map((pkg) => '"' + pkg + '"').join(' '),
      ignoreWorkspaceRootCheck: ignoreWorkspaceRootCheck
    };

    executioner('${node} ${yarn} add ${ignoreWorkspaceRootCheck} --peer --pure-lockfile ${packages}', options, function(error, result) {
      if (error) {
        console.error('Unable to install peerDependencies', error);
        process.exit(1);
        return;
      }
      done(result);
    });

    // Looks like yarn shows last line from the output of sub-scripts
    console.log('- Installing ' + packages.length +  ' peerDependencies...');
  };
}
