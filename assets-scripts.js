const fs = require('fs-extra');
const concat = require('concat');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

(async function buildAngularScripts() {
    await fs.copy('./node_modules/@webcomponents/custom-elements', './src/assets/custom-elements');
    await fs.copy('./node_modules/core-js/client', './src/assets/core-js');
    await fs.copy('./node_modules/zone.js/dist', './src/assets/zone.js');
    await fs.copy('./node_modules/rxjs/bundles', './src/assets/rxjs');
    await fs.copy('./node_modules/@angular/core/bundles', './src/assets/core/bundles');
    await fs.copy('./node_modules/@angular/common/bundles', './src/assets/common/bundles');
    await fs.copy('./node_modules/@angular/platform-browser/bundles', './src/assets/platform-browser/bundles');
    await fs.copy('./node_modules/@angular/elements/bundles', './src/assets/elements/bundles');

    const files = [
        './src/assets/custom-elements/src/native-shim.js',
        './src/assets/custom-elements/custom-elements.min.js',
        './src/assets/core-js/core.min.js',
        './src/assets/zone.js/zone.min.js',
        './src/assets/rxjs/rxjs.umd.min.js',
        './src/assets/core/bundles/core.umd.min.js',
        './src/assets/common/bundles/common.umd.min.js',
        './src/assets/platform-browser/bundles/platform-browser.umd.min.js',
        './src/assets/elements/bundles/elements.umd.min.js'
    ];
    await fs.ensureDir('./src/assets/elements');
    await concat(files, './src/assets/elements/scripts-bundle.js');
    console.log(chalkSuccess('Build Angular scripts success!'));
})();

(async function buildLanguages() {
    const languagesDir = './src/i18n';
    const languagesTempDir = './src/assets/auto-generated/i18n';

    const files = await fs.readdir(languagesDir);
    await fs.ensureDir(languagesTempDir);

    files.forEach(async file => {
        await fs.copy(languagesDir + '/' + file, languagesTempDir + '/' + file.replace('.json', '.js'));
    });
    console.log(chalkSuccess('Build languages success!'));
})();
