const pjson = require('../package.json');

exports.default = {
  config: function (cfg) {
    /* change source map generation based on production mode */
    const nodeEnv = (process.env.NODE_ENV || 'development').trim(); // trim is important because of an issue with package.json
    const isProd = nodeEnv === 'production';
    if (!isProd) { return cfg; }

    const sourceMapsDevToolPlugin = cfg.plugins.find(plugin => plugin.hasOwnProperty('sourceMapFilename'));
    sourceMapsDevToolPlugin.options.publicPath = 'https://sources.2sxc.org/' + pjson.version + '/ng-edit/';

    return cfg;
  }
}
