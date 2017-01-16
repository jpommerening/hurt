import { expect } from 'chai';

import template from 'lodash.template';
import phantom from 'phantomjs-prebuilt';
import * as webdriverio from 'webdriverio';

import server from './browser/server';
import routes from './routes.json';
import requests from './requests.json';
import { setup, test } from '../utils/e2e';

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

    if (process.env.TRAVIS) {
      this.timeout(45000);
      config.host = 'ondemand.saucelabs.com';
      config.port = 80;
      config.path = '/wd/hub';
      config.user = process.env.SAUCE_USERNAME;
      config.key = process.env.SAUCE_ACCESS_KEY;
      config.desiredCapabilities['browserName'] = 'firefox';
      config.desiredCapabilities['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
      config.desiredCapabilities['build'] = process.env.TRAVIS_BUILD_NUMBER;
    }

    browser = webdriverio.remote(config);

    if (!process.env.TRAVIS) {
      const p = phantom.exec('--webdriver=4444');
      browser.once('end', () => p.kill());
    }

    browser.init().url(`http://localhost:${port}`)
      .execute('setup', routes)
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
      browser.execute('navigate', options);
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
