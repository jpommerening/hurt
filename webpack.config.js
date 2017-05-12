/* eslint-env node */
'use strict';

var path = require('path');
var pkg = require('./package.json');

module.exports = {
  context: __dirname,
  entry: path.join(__dirname, pkg.browser.replace('lib/', 'src/')),
  output: {
    library: pkg.name,
    libraryTarget: 'umd',
    filename: pkg.name + '.js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        use: 'babel-loader'
      }
    ]
  }
};
