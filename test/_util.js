/* eslint-env mocha */

import '../src/_util';

describe('the private _util module is tested indirectly via the public modules', () => {
  // we don't want test coverage to imply usage of unused code
  // also, the module exposes no public API
});
