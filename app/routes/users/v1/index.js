import Router from 'koa-router';
import { auth, authz } from '../../../middleware/index.js';
import { User } from '../../../models/index.js';

const router = new Router({
  prefix: '/(v1|latest)/users',
});

// Get all users
router.get('/', auth, authz('user:list'), async (ctx) => {
  try {
    const result = await User.find({});
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

// Get one user
router.get('/:id', async (ctx) => {
  const result = await User.findById(ctx.params.id);
  if (result) {
    ctx.status = 200;
    ctx.body = result;
  }
  ctx.throw(404);
});

// Create a user
router.post('/', auth, authz('user:create'), async (ctx) => {
  try {
    const user = new User(ctx.request.body);
    await user.save();
    ctx.status = 201;
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

export default router;
