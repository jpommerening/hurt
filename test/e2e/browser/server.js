var fs = require('fs');
var path = require('path');
var http = require('http');
var webpack = require('webpack');
var MemoryFS = require('memory-fs');
var config = require('../../../webpack.config.js');
var pkg = require('../../../package.json');

// HACK: disable harmony modules because i hate phantomjs
delete config.module.loaders[0].use[0].options;

var PORT = process.env.PORT || process.env.npm_package_config_port || pkg.config.port;

var CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript'
};

var FS = new MemoryFS();

var SERVED_FILES = {
  '/index.html': file(path.join(__dirname, 'index.html')),
  '/lodash.template.js': library('lodash.template', FS),
  '/hurt.js': bundle(config, 'hurt.js', FS)
};

function library(name, fs) {
  return bundle({
    entry: require.resolve(name),
    output: {
      library: name,
      libraryTarget: 'umd',
      path: config.output.path,
      filename: name + '.js'
    }
  }, name + '.js', fs);
}

function bundle(config, filename, fs) {
  var ext = path.extname(filename);
  var type = CONTENT_TYPES[ext] || 'text/plain';
  var compiler = webpack(config);
  compiler.outputFileSystem = fs;

  return function (req, res) {
    compiler.run(function (err) {
      if (err) {
        return servererror(req, res)(err);
      }

      var content = fs.readFileSync(path.join(config.output.path, filename));
      res.writeHead(200, {'Content-Type': type});
      res.write(content);
      res.end();
    });
  };
}

function file(file) {
  var ext = path.extname(file);
  var type = CONTENT_TYPES[ext] || 'text/plain';

  return function (req, res) {
    fs.access(file, function(err) {
      if (err) {
        return notfound(req, res);
      }

      var stream = fs.createReadStream(file);
      res.writeHead(200, {'Content-Type': type});

      stream.pipe(res);
      stream.on('error', servererror(req, res));
    });
  };
}

function servererror(req, res, no) {
  return function (err) {
    res.writeHead(no || 500, {});
    res.write(err.message);
    res.end();
  };
}

function notfound(req, res) {
  res.writeHead(404, {});
  res.end();
}

function handler(req, res) {
  var url = req.url === '/' ? '/index.html' : req.url;

  res.once('finish', function () {
    req.destroy();
  });

  if (SERVED_FILES[url]) {
    return SERVED_FILES[url](req, res);
  }
  else {
    return notfound(req, res);
  }
}

var server = module.exports = http.createServer(handler);

if (!module.parent) {
  process.stdout.write('Listening on port ' + PORT + '\n');
  server.listen(PORT);
}
