const fs = require('node:fs');
const path = require('node:path');
const packageJson = require('../package.json');

/**
 * Replaces esbuild's local source-map URL with the public production URL.
 * The map itself remains in dist so it can be published to sources.2sxc.org,
 * while consumers of the JavaScript only need the hosted URL.
 */
function setExternalSourceMap(bundlePath, publicPath) {
  const sourceMapUrl = `https://sources.2sxc.org/${packageJson.version}${publicPath}${path.basename(bundlePath)}.map`;
  const bundle = fs.readFileSync(bundlePath, 'utf8');
  const sourceMapReference = /\/\/# sourceMappingURL=[^\r\n]+(?=\s*$)/;
  const patched = sourceMapReference.test(bundle)
    ? bundle.replace(sourceMapReference, `//# sourceMappingURL=${sourceMapUrl}`)
    : `${bundle.trimEnd()}\n//# sourceMappingURL=${sourceMapUrl}\n`;

  fs.writeFileSync(bundlePath, patched, 'utf8');
}

module.exports = setExternalSourceMap;
