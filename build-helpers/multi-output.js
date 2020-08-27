
// Important: this is duplicate code from 2sxc-ui -> webpack-helpers.js

var dnnRoot = process.env.Dev2sxcDnnRoot;
if(!dnnRoot) throw "Problem: environment variable 'Dev2sxcDnnRoot' doesn't exist. It should point to the web folder of your dev DNN";
var targetDnn = (dnnRoot + "DesktopModules\\ToSIC_SexyContent\\").replace('//', '/').replace('\\\\', '\\');

var devAssets = process.env.Dev2sxcAssets;
if(!devAssets) throw "Problem: environment variable 'Dev2sxcAssets' doesn't exist. It should point to the assets source folder in your 2sxc environment";
const targetAssets = (devAssets + '\\').replace('//', '/').replace('\\\\', '\\')

console.log('Will build to these targets: \n'
    + "* Dnn:  " + targetDnn + "\n"
    + '* 2sxc: ' + devAssets + '\n\n'
);


function createCopyAfterBuildPlugin(source, target, target2) {
  const WebpackShellPlugin = require('webpack-shell-plugin');
  const commands = [
      'echo Webpack Compile done - will now copy from project assets to DNN',
      // special note: folders in robocopy need to have a space after the name before closing " - special bug
      'robocopy /mir /nfl /ndl /njs "' + source + ' " "' + target + ' " & exit 0'
  ];
  if(target2) commands.push('robocopy /mir /nfl /ndl /njs "' + source + ' " "' + target2 + ' " & exit 0');
  return new WebpackShellPlugin({
      onBuildEnd: commands,
      dev: false  // run on every build end, not just once
  })
}

module.exports.createCopyAfterBuildPlugin = createCopyAfterBuildPlugin;
module.exports.DnnTargetFolder = targetDnn;
module.exports.AssetsTarget = targetAssets;
