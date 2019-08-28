const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const setExternalSourceMaps = require('../../build-helpers/external-source-maps');

const configuration = {
  mode: 'development',
  entry: ['./projects/field-string-wysiwyg-typescript/src/main/main.ts', './projects/field-string-wysiwyg-typescript/src/preview/preview.ts'],
  plugins: [
    new CleanWebpackPlugin(),
  ],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/i,
        use: 'raw-loader',
      },
      {
        test: /\.css$/,
        use: 'raw-loader',
      },
      {
        test: /\.svg$/,
        use: 'raw-loader',
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'wysiwyg-tinymce.js',
    path: path.resolve(__dirname, '../../dist/elements/field-string-wysiwyg'),
  },
};

/* change source map generation based on production mode */
const setFilename = true;
setExternalSourceMaps(configuration, 'elements/field-string-wysiwyg/', setFilename);

module.exports = configuration;
