/* global module */
import router from './router';
import { mixin as events } from './events';
import { mixin as node } from './node';
import { mixin as url } from './url';

router.mixins.push( events, node, url );

module.exports = router;
