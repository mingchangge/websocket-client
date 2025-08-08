const Router = require('@koa/router');
const router = new Router();
const tokenService = require('./utils/token');
const tokenBlacklist = tokenService.tokenBlacklist;

//数据导入
const { users } = require('./storage/db');

const isDev = process.env.NODE_ENV !== 'production';
console.log('isDev', isDev);


// 新增测试路由
router.get('/api/health-check', (ctx) => {
  ctx.body = { status: 'ok', port: 3000 }
})
// 登录接口
router.post('/api/login', async (ctx) => {
  const { username, password } = ctx.request.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    console.log('用户认证成功，准备设置cookie');
    try {
      // 生成双Token
      const { accessToken, refreshToken } = tokenService.generateTokens(user.id);
      // 设置新Cookie
      ctx.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: !isDev, // 生产环境启用
        sameSite: isDev ? 'lax' : 'strict', // 开发环境宽松策略
        path: '/', // 全站可用
        maxAge: 7 * 24 * 3600 * 1000 // 7天
      });

      ctx.body = {
        code: '000000',
        data: { access_token: accessToken },
        message: '登录成功'
      };
    } catch (error) {
      console.error('设置refresh_token cookie失败:', error);
      ctx.status = 500;
      ctx.body = { message: '设置cookie失败' };
    }
  } else {
    ctx.status = 401;
    ctx.body = { message: '认证失败' };
  }
});
// 刷新Token接口
router.post('/api/refresh_token', (ctx) => {
  const refreshToken = ctx.cookies.get('refresh_token');
  console.log('refreshToken====================》', refreshToken);
  // 验证RefreshToken
  try {
    // 使用tokenService验证令牌
    const decoded = tokenService.verifyToken(refreshToken);

    // 黑名单检查
    if (tokenBlacklist.has(refreshToken)) {
      ctx.status = 401;
      ctx.body = { code: 'AUTH_007', message: '刷新令牌已失效' };
      return;
    }

    // 生成新Token对（包含新refreshToken）
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      tokenService.generateTokens(decoded.userId);

    // 使旧RefreshToken失效
    tokenBlacklist.add(refreshToken);

    // 设置新Cookie
    ctx.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: !isDev, // 生产环境启用
      sameSite: isDev ? 'lax' : 'strict', // 开发环境宽松策略
      path: '/', // 全站可用
      maxAge: 7 * 24 * 3600 * 1000 // 7天
    });

    ctx.body = {
      code: '000000',
      data: { access_token: newAccessToken }
    };
  } catch (error) {
    // 统一错误处理
    const errorMap = {
      [tokenService.TokenExpiredError.name]: {
        code: 'AUTH_004',
        message: '刷新令牌已过期'
      },
      [tokenService.JsonWebTokenError.name]: {
        code: 'AUTH_005',
        message: '无效的刷新令牌'
      }
    };

    ctx.status = 401;
    ctx.body = errorMap[error.name] || {
      code: 'AUTH_000',
      message: '令牌刷新失败'
    };
  }
})
// 退出登录接口
router.post('/api/logout', async (ctx) => {
  console.log('退出登录接口被调用');
  const token = ctx.headers.authorization?.replace('Bearer ', '') || ctx.headers.token;

  try {
    // 验证token有效性
    const decoded = tokenService.verifyToken(token);

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
const authMiddleware = (options = { requireFresh: false }) => {
  return async (ctx, next) => {
    const token = ctx.headers.authorization?.replace('Bearer ', '') || ctx.headers.token;

    // 基础验证
    if (!token) {
      ctx.status = 401;
      ctx.body = { code: 'AUTH_001', message: '未提供认证信息' };
      console.error('认证失败：缺少令牌');
      return;
    }

    // 黑名单检查
    if (tokenBlacklist.has(token)) {
      ctx.status = 401;
      ctx.body = { code: 'AUTH_002', message: '令牌已失效' };
      console.warn('黑名单令牌尝试访问:', token);
      return;
    }

    try {
      // 令牌验证
      const isRefreshToken = ctx.path === '/api/refresh_token';
      const secret = isRefreshToken ? 'refresh-token-secret' : 'access-token-secret';
      const decoded = tokenService.verifyToken(token, {
        secret,
        ignoreExpiration: false
      });

      // 新鲜度验证（当需要时）
      if (options.requireFresh) {
        const bufferTime = options.bufferTime || 300; // 默认5分钟缓冲
        if (decoded.iat < (Date.now() / 1000 - bufferTime)) {
          ctx.status = 403;
          ctx.body = {
            code: 'AUTH_003',
            message: '令牌需要刷新',
            refreshUrl: '/api/token/refresh' // 可配置刷新端点
          };
          console.log('旧令牌尝试敏感操作:', decoded.userId);
          return;
        }
      }

      // 附加上下文信息
      ctx.state.user = {
        ...decoded,
        token, // 原始令牌
        issuedAt: new Date(decoded.iat * 1000)
      };

      await next();
    } catch (error) {
      // 错误分类处理
      const errorMap = {
        TokenExpiredError: { code: 'AUTH_004', message: '令牌已过期' },
        JsonWebTokenError: { code: 'AUTH_005', message: '令牌无效' },
        NotBeforeError: { code: 'AUTH_006', message: '令牌尚未生效' }
      };

      const errorInfo = errorMap[error.name] || {
        code: 'AUTH_000',
        message: '认证失败'
      };

      ctx.status = 401;
      ctx.body = errorInfo;
      console.error('认证错误:', error.name, error.message);
    }
  };
};

// 获取用户信息接口，使用中间件进行认证，可作为websocket链接失败的弥补手段，暂不实现功能
router.get('/api/user', authMiddleware(), async (ctx) => {
  // ... 
});
// 获取用户消息接口，使用中间件进行认证，可作为websocket链接失败的弥补手段，暂不实现功能
router.get('/api/messages', authMiddleware(), async (ctx) => {
  // ... 
});
// authMiddleware方法演示
router.post('/api/change-password', authMiddleware({
  requireFresh: true,
  bufferTime: 60 // 1分钟缓冲
}), async (ctx) => {
  // 模拟密码更改逻辑
});
module.exports = router;