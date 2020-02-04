const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const auth = require('../utils/auth')

var salt = bcrypt.genSaltSync(10);

module.exports = {
  /**
   * 登录
   */
  async signin(ctx){
    let { email, password } = ctx.request.body;
    console.log(`A user request to sign in, email: ${email}, password: ${password}`);
    let res = {
      success: false,
      user: null,
      message: '该邮箱尚未注册',
    };
    const user = await User.findOne({
      email: email
    });
    if(user){
      if(!bcrypt.compareSync(password, user.password)){
        res.message = '密码错误';
      }else{
        const token = auth.sign(ctx, {
          email: user.email,
          id: user._id
        })
        let { nickname, historyNumber, completedNumber } = user;
        res.user = { nickname, historyNumber, completedNumber, token};
        res.message = '登录成功';
        res.success = true;
      }
    }
    ctx.body = res;
  },

  /**
   * 注册
   */
  async signup(ctx){
    let { nickname, email, password } = ctx.request.body;
    console.log(`A user request to sign up, email: ${email}, password: ${password}`);
    let res = {
      success: false,
      message: '邮箱已被注册',
    }
    let user = await User.findOne({
      email: email
    });
    if(!user){
      // 加密用户密码
      password = bcrypt.hashSync(password, salt);
      const newUser = new User({
        nickname: nickname,
        email: email,
        password: password,
      });
      user = await newUser.save();
      res.success = true;
      res.message = '注册成功';
    }
    console.log(res.message);
    ctx.body = res;
  },

  /**
   * 获取用户信息
   */
  async getProfile(ctx){
    // koa-jwt已经验证过了token的有效性并提取了数据,保存在了user中
    const uid = ctx.state.user.id;
    let res = {
      success: false,
      userInfo: null,
      message: '获取信息失败',
    };
    const user = await User.findById(uid);
    console.log(user);
    let { nickname, historyNumber, completedNumber } = user;
    res.userInfo = { nickname, historyNumber, completedNumber};
    res.message = '获取信息成功';
    res.success = true;
    console.log(res.message);
    ctx.body = res;
  },

}