import { expect } from 'chai';

import http from 'http';
import connect from 'connect';

import routes from './routes.json';
import requests from './requests.json';
import { setup, test } from '../utils/e2e';

import hurt from '../../src/router';
import { mixin as node } from '../../src/node';
import { mixin as url } from '../../src/url';


const port = process.env.PORT || process.env.npm_package_config_port;

const app = connect();
const router = hurt().mixin(node({}), url({}));

setup({}, router, routes);

app.use(router);

describe('e2e connect', () => {

  let server;

  before(done => {
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
