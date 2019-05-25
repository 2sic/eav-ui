/** Copies Angular scripts to dist folder */
const fs = require('fs-extra');
const concat = require('concat');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

(async function buildAngularScripts() {
    const files = [
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
    await fs.ensureDir('./dist');
    await concat(files, './dist/core.js');
    console.log(chalkSuccess('Build Angular scripts (core) success!'));
})();
