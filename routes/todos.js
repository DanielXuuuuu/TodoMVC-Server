const router = require('koa-router')();
const todoController = require('../controllers/todos');

const routers = router
  .get('/todos', todoController.getList)
  .post('/todos', todoController.addItem)
  .put('/todos', todoController.modifyItem)
  .put('/todos/toggle', todoController.toggle)
  .delete('/todos', todoController.removeItem)
  .delete('/todos/deleteCompleted', todoController.removeAllCompleted);

module.exports = routers;