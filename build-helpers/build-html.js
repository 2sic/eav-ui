const fs = require('fs-extra');
const pjson = require('../package.json');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

(async function buildHtml() {
  const htmlSourcePath = './src/ui.html';
  const htmlOutputPath = './dist/ui.html';

  await fs.remove(htmlOutputPath);

  const sourceHtml = await fs.readFile(htmlSourcePath, 'utf8');
  const outputHtml = sourceHtml.replace(/SXC_VER/g, `${pjson.version}.${randomIntFromInterval(10000, 99999)}`);

  await fs.writeFile(htmlOutputPath, outputHtml, 'utf8');
  console.log(chalkSuccess('Build ui.html success!'));
})();

// helper
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
