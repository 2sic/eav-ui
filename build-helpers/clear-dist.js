/** Clears dist folder to be sure there are no leftover files which are no longer used */
const fs = require('fs-extra');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

fs.emptyDirSync('./dist');
// create angular.json outputPath
fs.ensureDirSync('./dist/ng-dialogs');
console.log(chalkSuccess('Dist folder emptied!'));
