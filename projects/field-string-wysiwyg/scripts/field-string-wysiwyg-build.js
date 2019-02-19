
const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  // const files = [
  //   './dist/field-string-wysiwyg/runtime.js',
  //   './dist/field-string-wysiwyg/polyfills.js',
  //   // './dist/field-string-wysiwyg/scripts.js',
  //   './dist/field-string-wysiwyg/main.js'
  // ];
  // await concat(files, './dist/field-string-wysiwyg/field-string-wysiwyg.js');
  await fs.ensureDir('../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/elements');
  await fs.copyFile('./dist/field-string-wysiwyg/main.js', '../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/elements/field-string-wysiwyg.js');
  // Assets
  await fs.ensureDir('../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/elements/assets');
  await fs.copy('./dist/field-string-wysiwyg/assets', '../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/elements/assets');
})();
