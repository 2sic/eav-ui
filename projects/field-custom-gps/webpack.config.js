const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const setExternalSourceMaps = require('../../build-helpers/external-source-maps-elements');

// 2020-08-27 2dm changed to have multi-targets
const multiOutput = require('../../build-helpers/multi-output');
const distPath = path.resolve(__dirname, '../../dist/system/field-custom-gps');
const targetDnn = path.resolve(multiOutput.DnnTargetFolder, './system/field-custom-gps');
const targetAssets = path.resolve(multiOutput.AssetsTarget, './system/field-custom-gps');

/** Checks webpack configuration to remove console.log, not node process.env.NODE_ENV used for external source maps */
let isProduction = false;
const args = process.argv.slice(2);
args.forEach((val, index) => {
  // console.log(`${index}: ${val}`);
  if (val === '--mode=production') {
    isProduction = true;
  }
});

const configuration = {
  mode: 'development',
  entry: ['./projects/field-custom-gps/src/main/main.ts', './projects/field-custom-gps/src/preview/preview.ts'],
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      '__PRODUCTION__': JSON.stringify(isProduction),
    }),
    multiOutput.createCopyAfterBuildPlugin(distPath, targetDnn, targetAssets),
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
    filename: 'index.js',
    path: distPath,
  },
};

/* change source map generation based on production mode */
setExternalSourceMaps(configuration, '/system/field-custom-gps/');

module.exports = configuration;
