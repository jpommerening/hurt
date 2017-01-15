import fs from 'fs';
import path from 'path';
import http from 'http';

const PORT = process.env.PORT || process.env.npm_package_config_port;

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript'
};

const SERVED_FILES = {
  '/index.html': file(path.join(__dirname, 'index.html'))
};

function file(file) {
  const ext = path.extname(file);
  const type = CONTENT_TYPES[ext] || 'text/plain';

  return function (req, res) {
    fs.access(file, function(err) {
      if (err) {
        return notfound(req, res);
      }

      const stream = fs.createReadStream(file);
      res.writeHead(200, {'Content-Type': type});

      stream.pipe(res);
      stream.on('end', () => {
        req.destroy();
      });
      stream.on('error', err => {
        res.writeHead(503, {});
        res.write(err.message);
        res.end();
        req.destroy();
      });
    });
  };
}

function notfound(req, res) {
  res.writeHead(404, {});
  res.end();
  req.destroy();
}

function handler(req, res) {
  const url = req.url === '/' ? '/index.html' : req.url;

  if (SERVED_FILES[url]) {
    return SERVED_FILES[url](req, res);
  }
  else {
    return notfound(req, res);
  }
}

const server = http.createServer(handler);

if (!module.parent) {
  server.listen(PORT);
}

export default server;
