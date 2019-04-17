const path = require('path');

module.exports = {
  mode: 'production',
  entry: './projects/field-custom-gps/src/main.ts',
  devtool: 'inline-source-map',
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
    filename: 'main.js',
    // path: path.resolve(__dirname, 'dist')
  },
  // watch: true,
  // watchOptions: {
  //   aggregateTimeout: 600
  // }
};
