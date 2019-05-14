/** Copies files from dist folder to DNN installation */
const chalk = require('chalk');
const chalkError = chalk.red;
const chalkSuccess = chalk.green;
const chokidar = require('chokidar');
const fs = require('fs-extra');

const sourcePath = 'dist';
const sourcePathMain = 'dist/main';
const outputPath = '../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit';

const calculatePaths = (path) => {
  path = path.replace(/\\/g, '/');
  const separatorIndex = path.lastIndexOf('/');

  const src = path.slice(0, separatorIndex);
  const file = path.slice(separatorIndex + 1);

  const dest = src.startsWith(`${sourcePathMain}`)
    ? `${outputPath}${src.replace(`${sourcePathMain}`, '')}`
    : `${outputPath}${src.replace(sourcePath, '')}`;

  return {
    src: src,
    file: file,
    dest: dest,
  }
}

console.log(chalkSuccess(`Copying files from ${sourcePath} to ${outputPath}`));

// Clear destination folder
fs.removeSync(outputPath);
fs.ensureDirSync(outputPath);

// Initialize watcher
const watcher = chokidar.watch(sourcePath, {
  persistent: true,
  usePolling: true,
});

// Add event listeners
watcher
  .on('add', path => {
    const paths = calculatePaths(path);
    fs.ensureDirSync(paths.dest);
    fs.copyFileSync(`${paths.src}/${paths.file}`, `${paths.dest}/${paths.file}`);
    // console.log(`Add ${paths.src}/${paths.file}\nto ${paths.dest}/${paths.file}`);
  })
  .on('change', path => {
    const paths = calculatePaths(path);
    fs.ensureDirSync(paths.dest);
    fs.copyFileSync(`${paths.src}/${paths.file}`, `${paths.dest}/${paths.file}`);
    // console.log(`Copy ${paths.src}/${paths.file}\nto ${paths.dest}/${paths.file}`);
  })
  .on('unlink', path => {
    const paths = calculatePaths(path);
    fs.removeSync(`${paths.dest}/${paths.file}`);
    // console.log(`Delete ${paths.src}/${paths.file}\nfrom ${paths.dest}/${paths.file}`);
  })
  .on('error', error => {
    console.log(chalkError(`Watcher error: ${error}`));
  })
  .on('ready', () => {
    console.log(chalkSuccess('Initial scan complete. Ready for changes!'));
  });
