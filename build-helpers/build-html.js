const fs = require('fs-extra');
const pjson = require('../package.json');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

function buildHtml(name) {
  let htmlSourcePath = './projects/ng-dialogs/src/' + name + '.html';
  let htmlOutputPath = './dist/' + name + '.html';

  fs.removeSync(htmlOutputPath);

  const sourceHtml = fs.readFileSync(htmlSourcePath, 'utf8');
  const outputHtml = sourceHtml.replace(/SXC_VER/g, `${pjson.version}.${randomIntFromInterval(10000, 99999)}`);

  fs.writeFileSync(htmlOutputPath, outputHtml, 'utf8');
  console.log(chalkSuccess('Build ' + name + '.html success!'));
}
buildHtml('ui');
buildHtml('local');

// helper
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
