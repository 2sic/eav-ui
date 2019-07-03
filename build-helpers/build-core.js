/** Copies Angular scripts to dist folder */
const fs = require('fs-extra');
const concat = require('concat');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

(async function buildAngularScripts() {
    const sourceFiles = [
        './node_modules/@webcomponents/custom-elements/src/native-shim.js',
        './node_modules/@webcomponents/custom-elements/custom-elements.min.js',
        './node_modules/core-js/client/core.min.js',
        './node_modules/zone.js/dist/zone.min.js',
        './node_modules/rxjs/bundles/rxjs.umd.min.js',
        './node_modules/@angular/core/bundles/core.umd.min.js',
        './node_modules/@angular/common/bundles/common.umd.min.js',
        './node_modules/@angular/platform-browser/bundles/platform-browser.umd.min.js',
        './node_modules/@angular/elements/bundles/elements.umd.min.js'
    ];
    const coreDir = './dist';
    const coreFile = '/core.js';
    await fs.ensureDir(coreDir);
    // remove old file
    await fs.remove(coreDir + coreFile);
    // build new file
    await concat(sourceFiles, coreDir + coreFile);
    console.log(chalkSuccess('Build Angular scripts (core) success!'));
})();
