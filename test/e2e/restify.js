import { expect } from 'chai';

import restify from 'restify';

import routes from './routes.json';
import requests from './requests.json';
import { setup, test } from '../utils/e2e';

import hurt from '../../src/router';
import { mixin as events } from '../../src/events';
import { mixin as rstify } from '../../src/restify';
import { mixin as url } from '../../src/url';

const port = process.env.PORT || process.env.npm_package_config_port;

describe('e2e restify', () => {

  let server;

  before(done => {
    hurt.mixins = [events, rstify, url];
    const router = hurt();

    server = restify.createServer({ router: router.restify });

    setup({
      mount(server, method, ...args) {
        if (method === 'use') {
          [
            'get',
            'put',
            'post',
            'del',
            'opts',
            'head',
            'patch'
          ].forEach(method => {
            server[method].apply(server, args);
          });
          return;
        }
        server[method].apply(server, args);
      }
    }, server, routes);
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
