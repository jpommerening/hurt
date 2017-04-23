/* global module */
import router from './router';
import { mixin as events } from './events';
import { mixin as named } from './named';
import { mixin as node } from './node';
import { mixin as url } from './url';

router.mixins.push( events, node, named, url );

module.exports = router;
