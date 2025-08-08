const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

const app = new Koa();
const PORT = 3000;
const isDev = process.env.NODE_ENV !== 'production';

// 导入路由和WebSocket处理
const router = require('./router');
const setupWebSocket = require('./websocket/websocket');

// 中间件
app.use(cors({
  origin: isDev ? (ctx) => { // 开发环境允许所有本地前端域名
    const origin = ctx.headers.origin;
    if (origin && origin.startsWith('http://localhost:')) {
      return origin; // 允许localhost下的任何端口
    }
    return 'http://localhost:8008'; // 默认端口
  } : 'https://your-frontend-domain.com', // 生产环境使用固定域名
  // 故障排除提示：
  // 1. 确保前端请求中设置了withCredentials: true
  // 2. 检查前端实际运行端口，确保与此处配置匹配
  // 3. 查看浏览器控制台>应用>存储>Cookie，确认是否有refresh_token
  // 4. 查看网络请求的响应头，确认Set-Cookie和Access-Control-Allow-Credentials是否存在
  credentials: true
}));
app.use(bodyParser());

// 使用路由
app.use(router.routes());
app.use(router.allowedMethods());


const server = app.listen(PORT, () => {
  console.log(`API 服务器运行在端口： ${PORT}`); // 输出服务器运行端口
});

// 设置WebSocket
setupWebSocket(server);