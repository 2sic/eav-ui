/** Copies languages in the correct format to dist folder */
const fs = require('fs-extra');
const chalk = require('chalk');
const chalkSuccess = chalk.green;

(async function buildLanguages() {
  const languagesDirs = [
    './projects/ng-dialogs/src/app/edit/assets/i18n',
    './projects/ng-dialogs/src/app/code-editor/i18n',
  ];
  const languagesTempDir = './dist/i18n';

  // remove languages folder before building
  await fs.emptyDir(languagesTempDir);
  await fs.rmdir(languagesTempDir);

  languagesDirs.forEach(async languagesDir => {
    const files = await fs.readdir(languagesDir);
    if (files.length === 0) return;

    // copy and rename language files
    await fs.ensureDir(languagesTempDir);
    files.forEach(async file => {
      await fs.copy(`${languagesDir}/${file}`, `${languagesTempDir}/${file.replace('.json', '.js')}`);
    });
  });
  console.log(chalkSuccess('Build languages success!'));
})();
