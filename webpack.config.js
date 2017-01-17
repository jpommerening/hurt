var pkg = require('./package.json');
var path = require('path');

module.exports = {
  entry: path.resolve(pkg.browser),
  output: {
    library: pkg.name,
    libraryTarget: 'umd',
    path: 'build',
    filename: pkg.name + '.js'
  }
};
