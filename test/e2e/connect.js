import { expect } from 'chai';

import http from 'http';
import connect from 'connect';

import routes from './routes.json';
import requests from './requests.json';
import { setup, test } from '../utils/e2e';

import hurt from '../../src/index';

const port = process.env.PORT || process.env.npm_package_config_port;

describe('e2e connect', () => {

  let server;

  before(done => {
    const app = connect();
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
