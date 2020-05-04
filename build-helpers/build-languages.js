/** Copies languages in the correct format to dist folder */
const fs = require('fs-extra');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

(async function buildLanguages() {
  const languagesDir = './projects/edit/assets/i18n';
  const languagesTempDir = './dist/i18n';

  const files = await fs.readdir(languagesDir);
  // remove languages folder before building
  await fs.emptyDir(languagesTempDir);
  await fs.rmdir(languagesTempDir);
  if (files.length === 0) return;

  // copy and rename language files
  await fs.ensureDir(languagesTempDir);
  files.forEach(async file => {
    await fs.copy(`${languagesDir}/${file}`, `${languagesTempDir}/${file.replace('.json', '.js')}`);
  });
  console.log(chalkSuccess('Build languages success!'));
})();
