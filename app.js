const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const routers = require('./routes/index');
const mongoose = require('mongoose');
const cors = require('koa2-cors');
const koajwt = require('koa-jwt');
const auth = require('./utils/auth')

const app = new Koa();

// 连接数据库
const dbConfig = require('./database/config');
mongoose.connect(dbConfig.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
  console.log('connection to mongodb!');
}).catch(err => {
  console.log(`db error ${err.message}`);
  process.exit(-1);
})

// 解决跨域
app.use(cors({
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Date'],
  maxAge: 100,
  credentials: true,
  allowMethods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Custom-Header', 'anonymous', 'Cache-Control']
}));

app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

// 捕获请求时没有token的错误，返回401
app.use((ctx, next) => {
  return next().catch(err => {
    if(err.status === 401){
      ctx.status = 401;
      ctx.body = 'Protected resource, use Authorization header to get access\n';
    }else{
      throw err;
    }
  })
})

// 使用koa-jwt，控制需要进行验证的接口
app.use(koajwt({
  secret: 'my_token',
}).unless({
  path: [/\/api\/signin/, /\/api\/signup/]
}))

// body解析
app.use(bodyParser());

// 路由注册
app.use(routers.routes()).use(routers.allowedMethods());

app.listen(8000);
console.log('app started at port 8000...');