// 整合所有路由
const Router = require('koa-router')
const user = require('./user')
const todos = require('./todos')

const router = new Router({
  prefix: '/api'
});

router.use('', user.routes(), user.allowedMethods());
router.use('', todos.routes(), todos.allowedMethods());

module.exports = router;
