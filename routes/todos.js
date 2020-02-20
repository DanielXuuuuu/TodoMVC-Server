const router = require('koa-router')();
const todoController = require('../controllers/todos');

const routers = router
  .get('/todos', todoController.getList)
  .post('/todos', todoController.addItem)
  .put('/todos/toggle', todoController.toggle)
  .put('/todos', todoController.modifyItem)
  .delete('/todos', todoController.removeItem)
  .delete('/todos/deleteCompleted', todoController.removeAllCompleted);

module.exports = routers;