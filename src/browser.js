/* global module */
import router from './common';
import { mixin as dom } from './dom';

router.mixins.unshift( dom );

module.exports = router;
