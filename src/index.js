/* global module */
import router from './common';
import { mixin as node } from './node';

router.mixins.unshift( node );

module.exports = router;
