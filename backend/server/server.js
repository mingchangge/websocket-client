const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const app = new Koa();
const PORT = 3000;

// 导入路由和WebSocket处理
const router = require('./router');
const setupWebSocket = require('./websocket/websocket');

// 中间件
app.use(cors());
app.use(bodyParser());

// 使用路由
app.use(router.routes());
app.use(router.allowedMethods());


const server = app.listen(PORT, () => {
  console.log(`API 服务器运行在端口： ${PORT}`); // 输出服务器运行端口
});

// 设置WebSocket
setupWebSocket(server);    