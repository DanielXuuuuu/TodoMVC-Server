const jwt = require('jsonwebtoken');
const AUTHORIZATION = 'Authorization';
const expiresIn = 60 * 60;
const tokenName = 'token';
const secret = 'my_token';

const auth = {
  sign: (ctx, info) => {
    const token = jwt.sign(info, secret, {expiresIn})
    ctx.set(AUTHORIZATION, `Bearer ${token}`);
    ctx.cookies.set(tokenName, token, {
      maxAge: expiresIn,
      httpOnly: true,
    })
    return token;
  },

  verify: (ctx, decodedToken, token) => {
    let res = true;
    try {
      const payload = jwt.verify(token, secret);
      res = false;
    } catch (err) {
      console.log(err.name);
    }
    return res;
  }
};

module.exports = auth;
