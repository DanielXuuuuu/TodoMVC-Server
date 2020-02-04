const router = require('koa-router')();
const userController = require('../controllers/user');

const routers = router
  .post('/signin', userController.signin)
  .post('/signup', userController.signup)
  .get('/profile', userController.getProfile);

module.exports = routers;