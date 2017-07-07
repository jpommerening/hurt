/* eslint-env node */
'use strict';

var path = require('path');
var pkg = require('./package.json');
var webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: path.join(__dirname, pkg.browser.replace('lib/', 'src/')),
  output: {
    library: pkg.name,
    libraryTarget: 'umd',
    filename: pkg.name + '.js',
    path: path.join(__dirname, 'dist')
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        use: [ {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [ [ 'es2015', { modules: false } ] ],
            plugins: [ 'transform-object-rest-spread' ],
            sourceMap: 'inline'
          }
        } ]
      }
    ]
  }
};
