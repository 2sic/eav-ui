const fs = require('fs-extra');

(function cleanLanguages() {
  const languagesTempDir = './src/assets/i18n';
  fs.removeSync(languagesTempDir);
})();
