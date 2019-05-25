const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const setExternalSourceMaps = require('../../build-helpers/external-source-maps');

const configuration = {
  mode: 'development',
  entry: ['./projects/field-custom-gps/src/main/main.ts', './projects/field-custom-gps/src/preview/preview.ts'],
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
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'gps-picker.js',
    path: path.resolve(__dirname, '../../dist/elements/field-custom-gps'),
  },
};

/* change source map generation based on production mode */
setExternalSourceMaps(configuration, 'elements/field-custom-gps/');

module.exports = configuration;
