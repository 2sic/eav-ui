const webpack = require('webpack');

/*
  2dm: change source map generation based on production mode
  our goal is to not include source maps in the distribution
  but have them when developing
*/
function setExternalSourceMaps(configuration, path, setFilename) {
  const nodeEnv = (process.env.NODE_ENV || 'development').trim(); // trim is important because of an issue with package.json
  const isProd = nodeEnv === 'production';
  const pjson = require('../package.json');

  console.log('isprod ' + isProd + '; process.env... ' + process.env.NODE_ENV);

  if (isProd) {
    // devTool option is not needed anymore for prod
    // but for development it's just easier to use then SourceMapDevToolPlugin
    configuration.devtool = false;

    if (!configuration.plugins) { configuration.plugins = []; }

    const options = {
      // this is the url of our local sourcemap server
      publicPath: 'https://sources.2sxc.org/' + pjson.version + '/ng-edit/' + path,
    };
    if (setFilename) {
      // at some point source maps for Angular app broke when filename was set so we are excluding filename from
      // options for Angular builds (main and WYSIWYG), but leaving it for regular webpack project (Custom GPS)
      options.filename = '[file].map';
    }
    const sourceMapDevToolPlugin = new webpack.SourceMapDevToolPlugin(options);

    configuration.plugins = [
      // ... other plugins
      ...configuration.plugins,
      sourceMapDevToolPlugin,
    ];
  }

  return configuration;
}

module.exports = setExternalSourceMaps;
