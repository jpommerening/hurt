/* eslint-env mocha */

import { expect } from 'chai';

import routes from '../routes.json';
import requests from '../requests.json';
import { test } from '../../utils/e2e';
import { capabilities, remote } from '../../utils/webdriver';
import server from './server';
import coverage from './coverage';

const port = process.env.PORT || process.env.npm_package_config_port;

describe('e2e browser', () => {

  let browser;
  let connected = false;
  let failed = false;

  before(done => {
    server.listen(port, done);
  });

  before(function (done) {
    browser = remote().init(capabilities());

    this.timeout(45000);

    browser
      .get(`http://localhost:${port}`)
      .then(() => {
        connected = true;
      })
      .execute('setup(arguments[0]);', [routes])
      .then(() => done(), err => done(err));
  });

  afterEach(function (done) {
    const passed = (this.currentTest.state === 'passed') && !failed;
    failed = !passed;
    if (!browser) {
      done();
    }
    else if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
      browser
        .sauceJobStatus(passed)
        .then(() => done(), err => done(err));
    }
    else {
      browser
        .then(() => done(), err => done(err));
    }
  });

  after(function (done) {
    if (connected) {
      this.timeout(45000);

      browser
        .execute('return window.__coverage__;')
        .then(coverage, () => {})
        .quit()
        .then(() => done(), done);
    }
    else {
      done();
    }
  });

  after(done => {
    server.close(done);
  });

  test({
    describe,
    it,
    xit,
    expect,
    port,
    request(options, callback) {
      browser
        .executeAsync('request(arguments[0], arguments[1]);', [options])
        .then(response => callback(null, response), err => callback(err));
    }
  }, requests);

});
