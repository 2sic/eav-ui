const setExternalSourceMaps = require('./build-helpers/external-source-maps');

var configuration = {
  // This ensures that much of the code is externalized into a separate package
  "externals": {
    "rxjs": "rxjs",
    "@angular/core": "ng.core",
    "@angular/common": "ng.common",
    "@angular/platform-browser": "ng.platformBrowser",
    "@angular/elements": "ng.elements"
  },
}

/* Rename wysiwyg main.js output file to wysiwyg-tinymce.js */
const args = process.argv.slice(2);
let isWysiwyg = false;

args.forEach((val, index) => {
  // console.log(`${index}: ${val}`);
  if (val === 'field-string-wysiwyg') {
    isWysiwyg = true;
  }
});

if (isWysiwyg) {
  configuration.output = {
    filename: (chunkData) => {
      return chunkData.chunk.name === 'main' ? 'wysiwyg-tinymce.js' : chunkData.chunk.name + '.js';
    },
  }
}

/* change source map generation based on production mode */
const sourceMapsPath = isWysiwyg ? 'elements/field-string-wysiwyg/' : '';
const setFilename = false;
setExternalSourceMaps(configuration, sourceMapsPath, setFilename);

module.exports = configuration;
