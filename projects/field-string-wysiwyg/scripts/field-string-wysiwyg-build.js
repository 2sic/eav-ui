
const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/field-string-wysiwyg/runtime.js',
    './dist/field-string-wysiwyg/polyfills.js',
    // './dist/field-string-wysiwyg/scripts.js',
    './dist/field-string-wysiwyg/main.js'
  ];
  await concat(files, './dist/field-string-wysiwyg/field-string-wysiwyg.js');
  await fs.ensureDir('../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/elements');
  await fs.copyFile('./dist/field-string-wysiwyg/field-string-wysiwyg.js', '../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/elements/field-string-wysiwyg.js');
  // CSS:
  await fs.ensureDir('../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/elements/assets/style');
  await fs.copyFile('./dist/field-string-wysiwyg/assets/style/tinymce-wysiwyg.css', '../2sxc-dnn742/Website/DesktopModules/ToSIC_SexyContent/dist/ng-edit/assets/elements/assets/style/tinymce-wysiwyg.css');
})();
