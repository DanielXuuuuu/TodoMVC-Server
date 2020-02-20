const User = require('../models/user')

module.exports = {

  /**
   * 获取
   */
  async getList(ctx){
    // uid信息由token中解码得到
    const uid  = ctx.state.user.id;
    let res = {
      success: false,
      message: '获取失败',
    };
    const user = await User.findById(uid);
    if(user){
      res.todos = user.todos;
      res.message = '获取成功';
      res.success = true;
    }
    ctx.body = res;
  },

  /**
   * 添加
   */
  async addItem(ctx){
    const uid = ctx.state.user.id;
    console.log(ctx.request.body);
    let res = {
      success: false,
      message: '添加失败',
      todos: null,
    };
    await new Promise((resolve, reject) => {
      User.findByIdAndUpdate(uid, 
        {
          $push: {"todos": ctx.request.body}, 
          $inc: {"historyNumber": 1}
        },
        {new: true, upsert: true},
        function(err, doc){
          if(err){
            reject(err);
          }else{
            res.success = true;
            res.message = '添加成功';
            res.todos = doc.todos;
            resolve();
          }
        }
      )
    });
    ctx.body = res;
  },

  /**
   * 删除
   */
  async removeItem(ctx){
    const uid = ctx.state.user.id;
    console.log(ctx.request.body);
    const { tid } = ctx.request.body;
    let res = {
      success: false,
      message: '删除失败',
      todos: null,
    };
    await new Promise((resolve, reject) => {
      User.findByIdAndUpdate(uid, 
        {$pull: {"todos": {_id: tid}}},
        {new: true},
        function(err, doc){
          if(err){
            reject(err);
          }else{
            res.success = true;
            res.message = '删除成功';
            res.todos = doc.todos;
            resolve();
          }
        }
      )
    });
    ctx.body = res;
  },

  /**
   * 修改
   */
  async modifyItem(ctx){
    const uid = ctx.state.user.id;
    const { tid, key, value } = ctx.request.body;
    let res = {
      success: true,
      message: '修改失败',
      num:0,
    };
    await new Promise((resolve, reject) => {
      User.updateOne({"_id":uid, "todos._id": tid},{ 
        $set:{
          [`todos.$.${key}`]:value
        }},
      {new: true},
      function(err, doc){
        if(err){
          reject(err);
        }else if(doc.nModified === 1){
          res.success = true;
          res.message = "修改成功";
          resolve();
        }
      })
    })
    if(res.success && key === 'completed'){
      const update = (value === true ? 1 : -1)
      await new Promise((resolve, reject) => {
        User.findByIdAndUpdate(uid,
          {$inc: {completedNumber: update}},
          function(err, doc){
            if(err){
              res.success = false;
              res.message = "修改失败";
              reject(err);
            }else if(doc){
              res.num = update;
              resolve();
            }
          })
        })
    }
    console.log(res);
    ctx.body = res;
  },

  /**
   * 反选
   */
  async toggle(ctx){
    const uid = ctx.state.user.id;
    const { value } = ctx.request.body;
    const oldValue = !value;
    let res = {
      success: true,
      message: '修改失败',
      num: 0,
    };
    const user = await User.findOne({_id: uid});
    const num = user.todos.reduce((count, todo) => 
      count + (todo.completed === oldValue), 0);
    console.log(num);
    await new Promise((resolve, reject) => {
      User.findById(uid, function(err, doc){
        if(err){
          reject(err);
        }
        doc.todos.forEach(function(todo){
          if(todo.completed === oldValue){
            todo.completed = value
          }
        });
        User.collection.save(doc);
        res.success = true;
        resolve();
      })
      
      // mongodb 3.6 写法
      // User.update({_id: uid, "todos.completed": oldValue},{
      //   $set:{ "todos.$[].completed": value}},
      //   {multi:true},
      //   function(err, doc){
      //     if(err){
      //       reject(err);
      //     }else if(doc){
      //       res.success = true;
      //       resolve();
      //     }
      // })
    });
    console.log(res);
    if(res.success){
      const updateNum = (oldValue === false) ? num : -num;
      await new Promise((resolve, reject) => {
        User.findByIdAndUpdate(uid,
          {$inc: {completedNumber: updateNum}},
          function(err, doc){
            if(err){
              res.success = false;
              reject(err);
            }else if(doc){
              res.message = "修改成功"
              res.num = updateNum;
              resolve();
            }
          })
        })
    }
    console.log(res);
    ctx.body = res;
  },

   /**
   * 删除所有已完成的
   */
  async removeAllCompleted(ctx){
    const uid = ctx.state.user.id;
    let res = {
      success: false,
      message: '删除失败',
      
    };
    await new Promise((resolve, reject) => {
      User.update({_id: uid},
        {$pull: {todos: {completed: true}}},
        {multi: true},
        function(err, doc){
          if(err){
            reject(err);
          }else{
            res.success = true;
            res.message = '删除成功';
            resolve();
          }
        }
      )
    });
    ctx.body = res;
  },
}