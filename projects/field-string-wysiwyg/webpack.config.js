const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const setExternalSourceMaps = require('../../build-helpers/external-source-maps-elements');
const multiOutput = require('../../build-helpers/multi-output');
const buildConfig = require('../../build-helpers/load-build-config.js').BuildConfig;
const distWysiwyg = path.resolve(__dirname, '../../dist/system/field-string-wysiwyg');

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
          to: './i18n/[name][ext]',
        },
        {
          from: './projects/field-string-wysiwyg/src/assets/2sxc-tinymce-skin',
          to: './',
        },
      ],
    }),
    multiOutput.createCopyAfterBuildPlugin(distWysiwyg, [...buildConfig.Sources, ...buildConfig.JsTargets], './system/field-string-wysiwyg'),
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
    path: distWysiwyg,
  },
  performance: {
    maxEntrypointSize: 1500000,
    maxAssetSize: 1500000,
  }
};

/* change source map generation based on production mode */
setExternalSourceMaps(configuration, '/system/field-string-wysiwyg/');

module.exports = configuration;
