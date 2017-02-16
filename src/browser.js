/* global module */
import router from './router';
import { mixin as dom } from './dom';
import { mixin as events } from './events';
import { mixin as url } from './url';

router.mixins.push( events, dom, url );

module.exports = router;
