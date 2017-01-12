/* elint-env node, mocha */

import { expect } from 'chai';

import { add, flatten, match } from '../src/trie';

describe('trie#add(trie, key, items)', () => {

  const tests = [
    {
      input: {},
      key: '',
      items: [1, 2, 3],
      expect: { '': [1, 2, 3] },
      it: 'adds empty keys to empty objects'
    },
    {
      input: {},
      key: 'key',
      items: [1, 2, 3],
      expect: { key: [1, 2, 3] },
      it: 'adds new keys to empty objects'
    },
    {
      input: { key: [1, 2, 3] },
      key: 'key',
      items: [4, 5, 6],
      expect: { key: [1, 2, 3, 4, 5, 6] },
      it: 'adds new items to existing keys on the root level'
    },
    {
      input: { keya: [1, 2, 3] },
      key: 'keyb',
      items: [4, 5, 6],
      expect: { key: { a: [1, 2, 3], b: [4, 5, 6] } },
      it: 'splits keys with common prefixes'
    },
    {
      input: { key: [1, 2, 3] },
      key: 'keyx',
      items: [4, 5, 6],
      expect: { key: { '': [1, 2, 3], x: [4, 5, 6] } },
      it: 'relocates items for keys that are prefixes of new keys'
    },
    {
      input: { keyx: [1, 2, 3] },
      key: 'key',
      items: [4, 5, 6],
      expect: { key: { x: [1, 2, 3], '': [4, 5, 6] } },
      it: 'relocates items for keys that are prefixed by new keys'
    },
    {
      input: { key: [1, 2, 3] },
      key: 'subtree',
      items: { x: [4, 5, 6] },
      expect: { key: [1, 2, 3], subtree: { x: [4, 5, 6] } },
      it: 'can add disjoint subtrees'
    }
  ];

  tests.forEach(test => {
    it(test.it, () => {
      const input = JSON.parse(JSON.stringify(test.input));
      const trie = add(test.input, test.key, test.items);
      expect(trie).to.eql(test.expect);
    });
  });

  it('does not modify the input trie', () => {
    tests.forEach(test => {
      const input = JSON.parse(JSON.stringify(test.input));
      const trie = add(test.input, test.key, test.items);
      expect(test.input).to.eql(input);
    });
  });

});

describe('tree#flatten(trie)', () => {

  it('returns a flat object with all keys of the nested trie', () => {
    const trie = {
      one: {
        '': [1, 2, 3],
        s: []
      },
      t: {
        wo: [4, 5, 6],
        hree: [7, 8, 9 ]
      }
    };

    expect(flatten(trie)).to.eql({
      one: [1, 2, 3],
      two: [4, 5, 6],
      three: [7, 8, 9],
      ones: []
    });
  });

});
