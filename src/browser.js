/* global module */
import router from './router';
import { mixin as dom } from './dom';
import { mixin as events } from './events';
import { mixin as named } from './named';
import { mixin as url } from './url';

router.mixins.push( events, dom, named, url );

module.exports = router;
