module.exports = (env) => {
  const envParam = 'parts';
  const all = 'all';
  const wysiwyg = 'wysiwyg';
  const gps = 'gps';

  console.log('===== Will build the parts of the UI =====');

  if (!env[envParam]) {
    throw `Parts parameter missing, please specify something like --env ${envParam}=${all}`;
  }

  const parts = env.parts === all
    ? [wysiwyg, gps]
    : env.parts.split(',');

  const configs = parts.reduce((result, part) => {
    if (part === wysiwyg) {
      const wysiwygConfig = require('./projects/field-string-wysiwyg/webpack.config.js');
      result.push(wysiwygConfig);
    } else if (part === gps) {
      const gpsConfig = require('./projects/field-custom-gps/webpack.config.js');
      result.push(gpsConfig);
    }
    return result;
  }, []);

  console.log('Will run', configs.length, 'parts:', parts.join(','));
  return configs;
};
