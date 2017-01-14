import { expect } from 'chai';

import path from 'path';
import fs from 'fs';
import http from 'http';
import * as webdriverio from 'webdriverio';

import routes from './routes.json';
import requests from './requests.json';
import { setup, test } from '../utils/e2e';

const port = process.env.PORT || process.env.npm_package_config_port;

describe('e2e browser', () => {

  let server;
  let browser;

  before(done => {
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript'
    };

    server = http.createServer(function (req, res) {
      const url = req.url === '/' ? '/index.html' : req.url;
      const file = path.join(__dirname, 'browser', url);
      const ext = path.extname(file);

      fs.access(file, function(err) {
        if (err) {
          res.writeHead(404, {});
          res.end();
          req.destroy();
          return;
        }

        const index = fs.createReadStream(file);
        res.writeHead(200, {'Content-Type': contentTypes[ext] || 'text/plain'});

        index.pipe(res);
        index.on('end', () => {
          req.destroy();
        });
      });
    });
    server.listen(port, done);
  });

  before(function (done) {
    const config = {
      desiredCapabilities: {
        browserName: 'firefox'
      }
    };

    if (process.env.TRAVIS) {
      this.timeout(45000);
      config.host = 'ondemand.saucelabs.com';
      config.port = 80;
      config.path = '/wd/hub';
      config.user = process.env.SAUCE_USERNAME;
      config.key = process.env.SAUCE_ACCESS_KEY;
      config.desiredCapabilities['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
      config.desiredCapabilities['build'] = process.env.TRAVIS_BUILD_NUMBER;
    }

    browser = webdriverio.remote(config);
    browser.init().url(`http://localhost:${port}`)
      .then(() => done(), done);
  });

  after(done => {
    server.close(done);
  });

  after(done => {
    browser.end()
      .then(() => done(), done);
  });

  test({
    describe,
    it,
    xit,
    expect,
    port,
    request(options, callback) {
      try {
        Promise.all( [
          browser.getText('#response-status'),
          browser.getText('#response-headers'),
          browser.getText('#response-data')
        ] ).then(([ status, headers, data ]) => {
          callback(null, {
            status: parseInt( status, 10 ),
            headers: JSON.parse( headers ),
            data
          });
        }, callback);
      }
      catch (err) {
        callback(err);
      }
    }
  }, requests);

});
