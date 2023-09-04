// Important: this is duplicate code from 2sxc-ui -> webpack-helpers.js
const WebpackShellPlugin = require('webpack-shell-plugin-next');

function createCopyAfterBuildPlugin(source, targets, addon) {
  console.log('createCopyAfterBuildPlugin:source', source, '; targets', targets, '; addon', addon);
  if (!source || !targets) return null;
  if (!Array.isArray(targets)) throw "Targets should be an array";
  if (!addon) throw "addon parameter missing - something like 'inpage'";
  const commands = [
    'echo Webpack Compile done - will now copy from project assets to DNN',
    // folders in robocopy need to have a space after the name before closing " - special bug
    // 'robocopy /mir /nfl /ndl /njs "' + source + ' " "' + target + ' " & exit 0'
  ];
  targets.forEach(t => {
    commands.push('robocopy /mir /nfl /ndl /njs "' + source + ' " "' + t + addon + ' " & exit 0');
  });
  return new WebpackShellPlugin({
    // must use onBuildExit and not onBuildEnd, as i18n files are otherwise not ready yet
    onBuildExit: {
      scripts: commands,
      parallel: false,
      blocking: true,
      safe: true, // experimental...
    },
    dev: false  // run on every build end, not just once
  })
}

module.exports.createCopyAfterBuildPlugin = createCopyAfterBuildPlugin;
