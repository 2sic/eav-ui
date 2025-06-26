const fs = require('fs');
const path = require('path');
const pjson = require('../package.json');

const BUILD_DIR = path.join(__dirname, '../dist/eav-ui');
// base URL for your source-map files
const PUBLIC_PATH = `https://sources.2sxc.org/${pjson.version}/dist/ng-edit/`;

fs.readdirSync(BUILD_DIR).forEach(file => {
  if (!file.endsWith('.js'))
      return;

  const full = path.join(BUILD_DIR, file);
  let js = fs.readFileSync(full, 'utf8');

  // replace only the final sourceMappingURL comment
  js = js.replace(
    /\/\/# sourceMappingURL=(.+)$/m,
    (_, mapFile) => `//# sourceMappingURL=${PUBLIC_PATH}${mapFile}`
  );

  fs.writeFileSync(full, js, 'utf8');
  console.log(`patched ${file}`);
});


