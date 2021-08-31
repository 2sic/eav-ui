/** Copies files from dist folder to DNN installation */
const chalk = require('chalk');
const chalkError = chalk.red;
const chalkSuccess = chalk.green;
const chokidar = require('chokidar');
const fs = require('fs-extra');

// 2020-08-27 2dm new copy to multiple targets specified in the environment variables
var dnnRoot = process.env.Dev2sxcDnnRoot;
if(!dnnRoot) throw "Problem: environment variable 'Dev2sxcDnnRoot' doesn't exist. It should point to the web folder of your dev DNN";
var targetDnn = (dnnRoot + "\\DesktopModules\\ToSIC_SexyContent\\").replace('//', '/').replace('\\\\', '\\');

var devAssets = process.env.Dev2sxcAssets;
if(!devAssets) throw "Problem: environment variable 'Dev2sxcAssets' doesn't exist. It should point to the assets source folder in your 2sxc environment";
const targetAssets = (devAssets + '\\').replace('//', '/').replace('\\\\', '\\')

console.log('Will build to these targets: \n'
    + "* Dnn:  " + targetDnn + "\n"
    + '* 2sxc: ' + devAssets + '\n\n'
);


let sourcePath = 'dist';
let sourcePathMain = 'dist/ng-dialogs';
let outputPath = targetDnn + 'dist\\ng-edit' ;
let outputAssets = targetAssets + 'dist\\ng-edit';

const excludeDirs = [
  'out-tsc', 'system',
];

let watchEnabled = false;
const args = process.argv.slice(2);
args.forEach((val, index) => {
  // console.log(`${index}: ${val}`);
  if (val === '--watch') {
    watchEnabled = true;
  }
});

const calculatePaths = (path) => {
  path = path.replace(/\\/g, '/');
  const separatorIndex = path.lastIndexOf('/');

  const src = path.slice(0, separatorIndex);
  const file = path.slice(separatorIndex + 1);

  const dest = src.startsWith(sourcePathMain)
    ? `${outputPath}${src.replace(sourcePathMain, '')}`
    : `${outputPath}${src.replace(sourcePath, '')}`;

  const destAssets = src.startsWith(sourcePathMain)
    ? `${outputAssets}${src.replace(sourcePathMain, '')}`
    : `${outputAssets}${src.replace(sourcePath, '')}`;

  return {
    src: src,
    file: file,
    dest: dest,
    destAssets: destAssets,
  }
}

const checkIfExcluded = (paths) => {
  const fullSourcePath = paths.src + '/' + paths.file;
  // Checks if folder is excluded from copying
  for (let i = 0; i < excludeDirs.length; i++) {
    const excludeDir = excludeDirs[i];
    const excludeDirClean = excludeDir.trim().replace(/^\/|\/$/g, '');
    const isExcluded = fullSourcePath.includes('/' + excludeDirClean + '/');
    // console.log(`Checking if excluded:\nFull: ${fullSourcePath}\nExclude: ${excludeDir}\nExcluded: ${isExcluded}`);
    if (isExcluded) return true;
  }
  return false;
}

console.log(chalkSuccess(`Copying files from ${sourcePath} to ${outputPath}`));

// Clear destination folders
fs.removeSync(outputPath);
fs.ensureDirSync(outputPath);
fs.removeSync(outputAssets);
fs.ensureDirSync(outputAssets);

// Initialize watcher
const watcher = chokidar.watch(sourcePath, {
  persistent: true,
  usePolling: true,
  interval: 200,
});

// Add event listeners
watcher
  .on('add', path => {
    const paths = calculatePaths(path);
    const isExcluded = checkIfExcluded(paths);
    // console.log(`Add ${paths.src}/${paths.file}\nto ${paths.dest}/${paths.file}\nis excluded: ${isExcluded}`);
    if (isExcluded) return;
    fs.ensureDirSync(paths.dest);
    fs.copyFileSync(`${paths.src}/${paths.file}`, `${paths.dest}/${paths.file}`);
    fs.ensureDirSync(paths.destAssets);
    fs.copyFileSync(`${paths.src}/${paths.file}`, `${paths.destAssets}/${paths.file}`);
  })
  .on('change', path => {
    const paths = calculatePaths(path);
    const isExcluded = checkIfExcluded(paths);
    // console.log(`Copy ${paths.src}/${paths.file}\nto ${paths.dest}/${paths.file}\nis excluded: ${isExcluded}`);
    if (isExcluded) return;
    fs.ensureDirSync(paths.dest);
    fs.copyFileSync(`${paths.src}/${paths.file}`, `${paths.dest}/${paths.file}`);
    fs.ensureDirSync(paths.destAssets);
    fs.copyFileSync(`${paths.src}/${paths.file}`, `${paths.destAssets}/${paths.file}`);
  })
  .on('unlink', path => {
    const paths = calculatePaths(path);
    const isExcluded = checkIfExcluded(paths);
    // console.log(`Delete ${paths.src}/${paths.file}\nfrom ${paths.dest}/${paths.file}\nis excluded: ${isExcluded}`);
    if (isExcluded) return;
    fs.removeSync(`${paths.dest}/${paths.file}`);
    fs.removeSync(`${paths.destAssets}/${paths.file}`);
  })
  .on('error', error => {
    console.log(chalkError(`Watcher error: ${error}`));
  })
  .on('ready', () => {
    if (!watchEnabled) {
      console.log(chalkSuccess(`Files copied from ${sourcePath} to ${outputPath}`));
      watcher.close();
      return;
    }
    console.log(chalkSuccess(`Files copied from ${sourcePath} to ${outputPath}. Watching for changes!`));
  });
