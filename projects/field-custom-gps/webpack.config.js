const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const setExternalSourceMaps = require('../../build-helpers/external-source-maps-elements');
const multiOutput = require('../../build-helpers/multi-output');
const buildConfig = require('@2sic.com/2sxc-load-build-config').BuildConfig;
const distPath = path.resolve(__dirname, '../../dist/system/field-custom-gps');

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
    multiOutput.createCopyAfterBuildPlugin(distPath, [...buildConfig.Sources, ...buildConfig.JsTargets], '/system/field-custom-gps'),
  ].filter(item => item !== null),
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
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Use CSS as a string
          'raw-loader',
          // Compiles Sass to CSS
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              // sourceMap: true,
            },
          },
        ],
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
