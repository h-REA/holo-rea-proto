const path = require('path');

module.exports = {
  entry: './src/index.js',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    modules: ['node_modules', path.resolve(__dirname, '../../node_modules')]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
