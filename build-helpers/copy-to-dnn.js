/** Copies files from dist folder to JsTargets and Sources */
const chalk = require('chalk');
const chalkError = chalk.red;
const chalkSuccess = chalk.green;
const chokidar = require('chokidar');
const fs = require('fs-extra');
const bc = require('@2sic.com/2sxc-load-build-config');
const buildConfig = bc.BuildConfig;

const sourcePath = 'dist';
const sourcePathMain = 'dist/eav-ui';
const outputPaths = [...buildConfig.JsTargets, ...buildConfig.Sources].map(t => `${t}/dist/ng-edit`);

const excludeDirs = [
  'out-tsc',
  'system',
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
  path = bc.fixPath(path);
  const separatorIndex = path.lastIndexOf('/');

  const src = path.slice(0, separatorIndex);
  const file = path.slice(separatorIndex + 1);

  const targets = outputPaths.map(p => src.startsWith(sourcePathMain) 
    ? `${p}${src.replace(sourcePathMain, '')}` 
    : `${p}${src.replace(sourcePath, '')}`);

  return {
    src,
    file,
    targets
  }
}

const checkIfExcluded = (paths) => {
  const fullSourcePath = `${paths.src}/${paths.file}`;
  // Checks if folder is excluded from copying
  return excludeDirs.some(excludeDir => {
    excludeDir = bc.fixPath(excludeDir, true, true);
    const isExcluded = fullSourcePath.startsWith(`${excludeDir}/`) || fullSourcePath.includes(`/${excludeDir}/`);
    // console.log(`Checking if excluded:\nFull: ${fullSourcePath}\nExclude: ${excludeDir}\nExcluded: ${isExcluded}`);
    return isExcluded;
  });
}

console.log(chalkSuccess(`Copying files from ${sourcePath} to ${outputPaths}`));

// Clear destination folders
outputPaths.forEach(target => {
  fs.readdir(target, (err, files) => {
    // Skip if folder doesn't exist (eg first build)
    if (!files) return;
    files.forEach(file => {
      // delete old files except Default.aspx
      if (file === 'Default.aspx') return;
      fs.removeSync(`${target}/${file}`);
    });
  });
  fs.ensureDirSync(target);
});

// Initialize watcher
const watcher = chokidar.watch([sourcePath, sourcePathMain], {
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
    paths.targets.forEach(target => {
      fs.ensureDirSync(target);
      fs.copyFileSync(`${paths.src}/${paths.file}`, `${target}/${paths.file}`);
    });
  })
  .on('change', path => {
    const paths = calculatePaths(path);
    const isExcluded = checkIfExcluded(paths);
    // console.log(`Copy ${paths.src}/${paths.file}\nto ${paths.dest}/${paths.file}\nis excluded: ${isExcluded}`);
    if (isExcluded) return;
    paths.targets.forEach(target => {
      fs.ensureDirSync(target);
      fs.copyFileSync(`${paths.src}/${paths.file}`, `${target}/${paths.file}`);
    });
  })
  .on('unlink', path => {
    const paths = calculatePaths(path);
    const isExcluded = checkIfExcluded(paths);
    // console.log(`Delete ${paths.src}/${paths.file}\nfrom ${paths.dest}/${paths.file}\nis excluded: ${isExcluded}`);
    if (isExcluded) return;
    paths.targets.forEach(target => {
      fs.removeSync(`${target}/${paths.file}`);
    }); 
  })
  .on('error', error => {
    console.log(chalkError(`Watcher error: ${error}`));
  })
  .on('ready', () => {
    if (!watchEnabled) {
      console.log(chalkSuccess(`Files copied from ${sourcePath} to ${outputPaths}`));
      watcher.close();
      return;
    }
    console.log(chalkSuccess(`Files copied from ${sourcePath} to ${outputPaths}. Watching for changes!`));
  });
