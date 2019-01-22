
const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/wysiwyg-webcomponent/runtime.js',
    './dist/wysiwyg-webcomponent/polyfills.js',
    // './dist/wysiwyg-webcomponent/scripts.js',
    './dist/wysiwyg-webcomponent/main.js'
  ];
  await concat(files, './dist/wysiwyg-webcomponent/wysiwyg-webcomponent.js');
  await fs.ensureDir('../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/elements');
  await fs.copyFile('./dist/wysiwyg-webcomponent/wysiwyg-webcomponent.js', '../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/elements/wysiwyg-webcomponent.js');
})();
