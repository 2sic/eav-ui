const fs = require('fs-extra');
const pjson = require('../package.json');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

function buildHtml(name) {
  let htmlSourcePath = './projects/edit/src/' + name + '.html';
  let htmlOutputPath = './dist/' + name + '.html';

  let ngDialogs = false;
  const args = process.argv.slice(2);
  args.forEach((val, index) => {
    // console.log(`${index}: ${val}`);
    if (val === '--ng-dialogs') {
      ngDialogs = true;
      htmlSourcePath = './projects/ng-dialogs/src/' + name + '.html';
      htmlOutputPath = './dist/ng-dialogs/' + name + '.html';
      fs.ensureDirSync('./dist/ng-dialogs/');
    }
  });

  fs.removeSync(htmlOutputPath);

  const sourceHtml = fs.readFileSync(htmlSourcePath, 'utf8');
  const outputHtml = sourceHtml.replace(/SXC_VER/g, `${pjson.version}.${randomIntFromInterval(10000, 99999)}`);

  fs.writeFileSync(htmlOutputPath, outputHtml, 'utf8');
  if (ngDialogs) {
    console.log(chalkSuccess('Build ng-dialogs ' + name + '.html success!'));
  } else {
    console.log(chalkSuccess('Build ' + name + '.html success!'));
  }
}
buildHtml('ui');
buildHtml('local');

// helper
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
