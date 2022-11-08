import Router from 'koa-router';
import { Post } from '../../../models/index.js';
import { auth, authz, cache } from '../../../middlewares/index.js';

const router = new Router({
  prefix: '/(v1|latest)/posts',
});

// Get all posts
router.get('/', cache(300), async (ctx) => {
  try {
    const result = await Post.find({});
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

// Get one post
router.get('/:id', cache(300), async (ctx) => {
  const result = await Post.findById(ctx.params.id);
  if (!result) {
    ctx.throw(404);
  }
  ctx.status = 200;
  ctx.body = result;
});

// Query posts
router.post('/query', cache(300), async (ctx) => {
  const { query = {}, options = {} } = ctx.request.body;
  try {
    const result = await Post.paginate(query, options);
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

// Create a post
router.post('/', auth, async (ctx) => {
  try {
    const post = new Post(ctx.request.body);
    await post.save();
    ctx.status = 201;
  } catch (error) {
    ctx.throw(400, error.message);
  }
});

export default router;
