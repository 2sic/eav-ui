/** Copies languages in the correct format to dist folder */
const fs = require('fs-extra');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

(async function buildLanguages() {
  const languagesDir = './src/i18n';
  const languagesTempDir = './dist/i18n';

  const files = await fs.readdir(languagesDir);
  await fs.ensureDir(languagesTempDir);

  files.forEach(async file => {
    await fs.copy(`${languagesDir}/${file}`, `${languagesTempDir}/${file.replace('.json', '.js')}`);
  });
  console.log(chalkSuccess('Build languages success!'));
})();
