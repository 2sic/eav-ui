const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const setExternalSourceMaps = require('../../build-helpers/external-source-maps-elements');

// 2020-08-27 2dm changed to have multi-targets
const multiOutput = require('../../build-helpers/multi-output');
const distWysiwyg = path.resolve(__dirname, '../../dist/system/field-string-wysiwyg');
const targetDnnWysiwyg = path.resolve(multiOutput.DnnTargetFolder, './system/field-string-wysiwyg');
const targetAssetsWysiwyg = path.resolve(multiOutput.AssetsTarget, './system/field-string-wysiwyg');

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
  entry: [
    './projects/field-string-wysiwyg/src/field-string-wysiwyg/field-string-wysiwyg.ts',
    './projects/field-string-wysiwyg/src/preview/preview.ts',
    './projects/field-string-wysiwyg/src/editor/editor.ts',
  ],
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      '__PRODUCTION__': JSON.stringify(isProduction),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: './projects/field-string-wysiwyg/src/i18n/*.js',
          to: './i18n',
          flatten: true,
        },
        {
          from: './projects/field-string-wysiwyg/src/assets/2sxc-tinymce-skin',
          to: './',
        },
      ],
    }),
    multiOutput.createCopyAfterBuildPlugin(distWysiwyg, targetDnnWysiwyg, targetAssetsWysiwyg),
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
    path: distWysiwyg,
  },
};

/* change source map generation based on production mode */
setExternalSourceMaps(configuration, '/system/field-string-wysiwyg/');

module.exports = configuration;
