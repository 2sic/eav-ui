// Used to append SXC_VER to file names in local.html. ATM it's not used at all because we are not using local.html
const fs = require('fs-extra');
const pjson = require('../package.json');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

function buildHtml(name) {
  let htmlSourcePath = './projects/eav-ui/src/' + name + '.html';
  let htmlOutputPath = './dist/' + name + '.html';

  fs.removeSync(htmlOutputPath);

  const sourceHtml = fs.readFileSync(htmlSourcePath, 'utf8');
  const outputHtml = sourceHtml.replace(/SXC_VER/g, `${pjson.version}.${Math.floor(Math.random() * 99999)}`);

  fs.writeFileSync(htmlOutputPath, outputHtml, 'utf8');
  console.log(chalkSuccess('Build ' + name + '.html success!'));
}
buildHtml('local');
