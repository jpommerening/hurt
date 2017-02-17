/* eslint-env mocha */

import { expect } from 'chai';

import http from 'http';
import express from 'express';

import routes from './routes.json';
import requests from './requests.json';
import { setup, test } from '../utils/e2e';

import hurt from '../../src/index';

const port = process.env.PORT || process.env.npm_package_config_port;

describe('e2e express', () => {

  let server;

  before(done => {
    const app = express();
    const router = hurt();

    setup({}, router, routes);

    app.use(router);

    server = http.createServer(app);
    server.listen(port, done);
  });

  after(done => {
    server.close(done);
  });

  test({
    describe,
    it,
    xit,
    expect,
    port
  }, requests);

});
