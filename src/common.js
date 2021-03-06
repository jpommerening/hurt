import router from './router';
import { mixin as named } from './named';
import { mixin as regexpRoute } from './regexp-route';
import { mixin as templateRoute } from './template-route';
import { mixin as timeout } from './timeout';
import { mixin as url } from './url';

router.mixins.push( timeout, named, regexpRoute, templateRoute, url );

export default router;
