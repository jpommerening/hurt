import { expect } from 'chai';

import routes from '../routes.json';
import requests from '../requests.json';
import { test } from '../../utils/e2e';
import webdriver from '../../utils/webdriver';
import server from './server';

const port = process.env.PORT || process.env.npm_package_config_port;

describe('e2e browser', () => {

  let browser;

  before(done => {
    server.listen(port, done);
  });

  before(function (done) {
    browser = webdriver();

    this.timeout(45000);

    browser
      .init()
      .url(`http://localhost:${port}`)
      .executeAsync(function run(routes, callback) {
        setup(routes);
        callback();
      }, routes)
      .then(() => done(), err => done(err));
  });

  after(done => {
    server.close(done);
  });

  after(done => {
    browser
      .end()
      .then(() => done(), done);
  });

  test({
    describe,
    it,
    xit,
    expect,
    port,
    request(options, callback) {
      browser
        .executeAsync(function run(options, callback) {
          request(options, function (err, response) {
            if (err) {
              throw err;
            }
            callback(response);
          });
        }, options)
        .then(response => callback(null, response), err => callback(err));
    }
  }, requests);

});
