const fs = require('fs-extra');
const concat = require('concat');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

(async function buildAngularScripts() {
    await fs.copy('./node_modules/@webcomponents/custom-elements', './src/assets/auto-generated/custom-elements');
    await fs.copy('./node_modules/core-js/client', './src/assets/auto-generated/core-js');
    await fs.copy('./node_modules/zone.js/dist', './src/assets/auto-generated/zone.js');
    await fs.copy('./node_modules/rxjs/bundles', './src/assets/auto-generated/rxjs');
    await fs.copy('./node_modules/@angular/core/bundles', './src/assets/auto-generated/core/bundles');
    await fs.copy('./node_modules/@angular/common/bundles', './src/assets/auto-generated/common/bundles');
    await fs.copy('./node_modules/@angular/platform-browser/bundles', './src/assets/auto-generated/platform-browser/bundles');
    await fs.copy('./node_modules/@angular/elements/bundles', './src/assets/auto-generated/elements/bundles');

    const files = [
        './src/assets/auto-generated/custom-elements/src/native-shim.js',
        './src/assets/auto-generated/custom-elements/custom-elements.min.js',
        './src/assets/auto-generated/core-js/core.min.js',
        './src/assets/auto-generated/zone.js/zone.min.js',
        './src/assets/auto-generated/rxjs/rxjs.umd.min.js',
        './src/assets/auto-generated/core/bundles/core.umd.min.js',
        './src/assets/auto-generated/common/bundles/common.umd.min.js',
        './src/assets/auto-generated/platform-browser/bundles/platform-browser.umd.min.js',
        './src/assets/auto-generated/elements/bundles/elements.umd.min.js'
    ];
    await fs.ensureDir('./src/assets/auto-generated/elements');
    await concat(files, './src/assets/auto-generated/elements/scripts-bundle.js');
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
