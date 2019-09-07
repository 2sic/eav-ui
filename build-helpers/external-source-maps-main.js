var webpack = require('webpack');
const pjson = require('../package.json');

exports.default = {
  config: function (cfg) {
    /* change source map generation based on production mode */
    const nodeEnv = (process.env.NODE_ENV || 'development').trim(); // trim is important because of an issue with package.json
    const isProd = nodeEnv === 'production';
    if (!isProd) { return cfg; }

    const args = process.argv.slice(2);
    let isWysiwyg = false;
    args.forEach((val, index) => {
      // console.log(`${index}: ${val}`);
      if (val === 'field-string-wysiwyg') {
        isWysiwyg = true;
      }
    });
    const sourceMapsPath = isWysiwyg ? 'elements/field-string-wysiwyg/' : '';
    const sourceMapsDevToolPlugin = cfg.plugins.find(plugin => plugin instanceof webpack.SourceMapDevToolPlugin);
    sourceMapsDevToolPlugin.options.publicPath = 'https://sources.2sxc.org/' + pjson.version + '/ng-edit/' + sourceMapsPath;

    return cfg;
  }
}
