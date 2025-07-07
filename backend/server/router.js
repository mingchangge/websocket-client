const Router = require('@koa/router');
const router = new Router();
const jwt = require('jsonwebtoken');

// 模拟黑名单存储，在实际应用中，建议使用数据库或缓存系统（如Redis）来存储
const tokenBlacklist = new Set();
// 模拟用户数据库
const users = [
  { id: 1, username: 'admin', password: 'password', email: 'admin@example.com' }
];

// 模拟消息数据库
const messages = [
  { id: 1, userId: 1, content: '欢迎使用系统', timestamp: Date.now() - 3600000 },
  { id: 2, userId: 1, content: '您有新的通知', timestamp: Date.now() - 1800000 }
];
// 新增测试路由
router.get('/api/health-check', (ctx) => {
  ctx.body = { status: 'ok', port: 3000 }
})
// 登录接口
router.post('/api/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '24h' });
    ctx.body = { code: '000000', message: '登录成功', token };
  } else {
    ctx.status = 401;
    ctx.body = { message: '认证失败' };
  }
});
// 退出登录接口
router.post('/api/logout', async (ctx) => {
  console.log('退出登录接口被调用', ctx);
  const token = ctx.headers.authorization?.replace('Bearer ', '') || ctx.headers.token;

  try {
    // 验证token有效性
    const decoded = jwt.verify(token, 'your-secret-key');

    // 将token添加到黑名单
    tokenBlacklist.add(token);

    // 返回标准响应格式
    ctx.status = 200;
    ctx.body = {
      code: '000000',
      data: {
        userId: decoded.userId,
        logoutTime: new Date().toISOString()
      },
      message: '退出登录成功'
    };
  } catch (error) {
    console.error('退出登录失败:', error);
    ctx.status = 401;
    ctx.body = {
      code: '999999',
      data: { error: error.name },
      message: '无效的认证信息'
    };
  }
});

// 在需要验证的路由前添加中间件
const authMiddleware = async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '') || ctx.headers.token;

  if (!token) {
    ctx.status = 401;
    ctx.body = { message: '未提供认证信息' };
    return;
  }

  // 检查token是否在黑名单中
  if (tokenBlacklist.has(token)) {
    ctx.status = 401;
    ctx.body = { message: '令牌已失效' };
    return;
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    ctx.state.user = decoded;
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = { message: '无效的认证信息' };
  }
};

// 获取用户信息接口，使用中间件进行认证，可作为websocket链接失败的弥补手段，暂不实现功能
router.get('/api/user', authMiddleware, async (ctx) => {
  // ... 
});
// 获取用户消息接口，使用中间件进行认证，可作为websocket链接失败的弥补手段，暂不实现功能
router.get('/api/messages', authMiddleware, async (ctx) => {
  // ... 
});
module.exports = router;    