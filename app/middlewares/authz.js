/**
 * Authorization Middleware
 * @param   {String} role
 * @returns {void}
 */
const authzHandler = (role) => async (ctx, next) => {
  const { roles } = ctx.state;
  const allowed = roles.includes(role);
  if (allowed) {
    await next();
    return;
  }
  ctx.status = 403;
};

export default authzHandler;
