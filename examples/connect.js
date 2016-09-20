import connect from 'connect';
import hurt from 'hurt';

const app = connect();
const router = hurt();

router.use(function(req, res, next) {
  console.log(new Date());
  next();
});

router.use('/channel/{chan}', function(req, res, next) {
  res.send(200, req.param.chan);
});

app.use(router);
