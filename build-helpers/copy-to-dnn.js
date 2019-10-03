/** Copies files from dist folder to DNN installation */
const chalk = require('chalk');
const chalkError = chalk.red;
const chalkSuccess = chalk.green;
const chokidar = require('chokidar');
const fs = require('fs-extra');

const sourcePath = 'dist';
const sourcePathMain = 'dist/main';
const outputPath = '../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit';
const excludeDirs = [
  'out-tsc',
];
const args = process.argv.slice(2);
let watchEnabled = false;

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

  return {
    src: src,
    file: file,
    dest: dest,
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

// Clear destination folder
fs.removeSync(outputPath);
fs.ensureDirSync(outputPath);

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
  })
  .on('change', path => {
    const paths = calculatePaths(path);
    const isExcluded = checkIfExcluded(paths);
    // console.log(`Copy ${paths.src}/${paths.file}\nto ${paths.dest}/${paths.file}\nis excluded: ${isExcluded}`);
    if (isExcluded) return;
    fs.ensureDirSync(paths.dest);
    fs.copyFileSync(`${paths.src}/${paths.file}`, `${paths.dest}/${paths.file}`);
  })
  .on('unlink', path => {
    const paths = calculatePaths(path);
    const isExcluded = checkIfExcluded(paths);
    // console.log(`Delete ${paths.src}/${paths.file}\nfrom ${paths.dest}/${paths.file}\nis excluded: ${isExcluded}`);
    if (isExcluded) return;
    fs.removeSync(`${paths.dest}/${paths.file}`);
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
