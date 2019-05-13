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
    await fs.ensureDir('./src/assets/elements');
    await concat(files, './src/assets/elements/core.js');
    console.log(chalkSuccess('Build Angular scripts success!'));
})();

(async function buildLanguages() {
    const languagesDir = './src/i18n';
    const languagesTempDir = './src/assets/i18n';

    const files = await fs.readdir(languagesDir);
    await fs.ensureDir(languagesTempDir);

    files.forEach(async file => {
        await fs.copy(languagesDir + '/' + file, languagesTempDir + '/' + file.replace('.json', '.js'));
    });
    console.log(chalkSuccess('Build languages success!'));
})();
