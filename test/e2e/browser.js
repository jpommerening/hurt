import { expect } from 'chai';

import template from 'lodash.template';
import * as webdriverio from 'webdriverio';

import server from './browser/server';
import routes from './routes.json';
import requests from './requests.json';
import { test } from '../utils/e2e';

const port = process.env.PORT || process.env.npm_package_config_port;

describe('e2e browser', () => {

  let browser;

  before(done => {
    server.listen(port, done);
  });

  before(function (done) {
    const config = {
      desiredCapabilities: {}
    };

    if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
      this.timeout(45000);
      config.hostname = 'ondemand.saucelabs.com';
      config.port = 80;
      config.auth = `${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}`;
    }
    if (process.env.TRAVIS) {
      config.desiredCapabilities['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
      config.desiredCapabilities['build'] = process.env.TRAVIS_BUILD_NUMBER;
    }
    if (process.env.BROWSER) {
      config.desiredCapabilities['browserName'] = process.env.BROWSER;
    }

    browser = webdriverio.remote(config);

    browser
      .init()
      .url(`http://localhost:${port}`)
      .execute('setup(arguments[0])', routes)
      .then(() => done(), err => {
        done(err);
      });
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
        .executeAsync('request(arguments[0], arguments[1])', options)
        .then(response => callback(null, response.value), callback);
    }
  }, requests);

});
