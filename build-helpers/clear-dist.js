/** Clears dist folder to be sure there are no leftover files which are no longer used */
const fs = require('fs-extra');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

let ngDialogs = false;
const args = process.argv.slice(2);
args.forEach((val, index) => {
  // console.log(`${index}: ${val}`);
  if (val === '--ng-dialogs') { ngDialogs = true; }
});

if (ngDialogs) {
  fs.emptyDirSync('./dist');
  console.log(chalkSuccess('NgDialogs dist folder emptied!'));
} else {
  fs.emptyDirSync('./dist');
  console.log(chalkSuccess('Dist folder emptied!'));
}
