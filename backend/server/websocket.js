const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

// 模拟用户数据库
const users = [
  { id: 1, username: 'admin', password: 'password', email: 'admin@example.com' }
];
// 客户端映射表
const clients = new Map();

// 模拟消息数据库
const messages = [];

module.exports = (server) => {
  const wss = new WebSocket.Server({
    noServer: true,
    perMessageDeflate: false, // 强制禁用压缩
    clientTracking: true,
    maxPayload: 1048576
  });

  // 处理升级请求
  server.on('upgrade', (request, socket, head) => {
    // 解析token逻辑
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');
    console.log("token```", token);
    // 认证处理（新增黑名单检查）
    const handleAuthFailure = (errorCode, message) => {
      const wssTemp = new WebSocket.Server({ noServer: true });
      wssTemp.handleUpgrade(request, socket, head, (ws) => {
        // 发送结构化错误信息
        ws.close(4401, JSON.stringify({
          type: 'forceLogout',
          code: errorCode,
          message
        }));

        // 清理定时器（新增）
        const closeTimer = setTimeout(() => ws.terminate(), 1000);
        ws.on('close', () => clearTimeout(closeTimer));
      });
    };

    if (!token) {
      handleAuthFailure('WS_001', '缺少认证令牌');
      return;
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
        const errorMap = {
          TokenExpiredError: ['WS_002', '令牌已过期'],
          JsonWebTokenError: ['WS_003', '无效令牌']
        };
        const [code, msg] = errorMap[err.name] || ['WS_000', '认证失败'];
        handleAuthFailure(code, msg);
        return;
      }

      // 新增黑名单检查（需要从 router.js 引入 tokenBlacklist）
      if (global.tokenBlacklist?.has(token)) { // 已通过全局变量共享
        handleAuthFailure('AUTH_002', '令牌已失效');
        return;
      }

      // 正确升级协议
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, {
          userId: decoded.userId,
          token // 新增 token 传递
        });
      });
    });
  });
  // 处理WebSocket连接
  wss.on('connection', (ws, { userId, token }) => {
    console.log('WebSocket 连接已建立', userId);
    ws.token = token
    // 将客户端添加到映射表中
    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    clients.get(userId).add(ws);

    console.log(`用户 ${userId} 已连接WebSocket`);
    // 发送用户专属信息
    sendUserInfo(ws, userId);
    const contentList = [{
      id: 4,
      userId: 1,
      content: '这是一条推送消息1',
      timestamp: Date.now(),
    }, {
      id: 3,
      userId: 1,
      content: '您有新的通知2',
      timestamp: Date.now() - 1800000 // 30分钟前
    }, {
      id: 2,
      userId: 1,
      content: '您有新的通知3',
      timestamp: Date.now() - 3600000 // 1小时前
    }, {
      id: 1,
      userId: 1,
      content: '欢迎使用系统',
      timestamp: Date.now() - 3600000 // 1小时前
    }]
    // 发送历史消息
    sendNotification(userId, contentList);
    // 发送欢迎消息
    ws.send(JSON.stringify({
      content: 'WebSocket 连接已建立',
      timestamp: Date.now()
    }));
    // 发送token过期通知-提前1s发送
    sendUserTokenExpired(ws);
    // 处理消息
    ws.on('message', (message) => {
      console.log(`收到来自用户 ${userId} 的消息: ${message}`);
      // 这里可以处理客户端发送的消息
    });

    // 处理断开连接
    ws.on('close', () => {
      if (clients.has(userId)) {
        clients.get(userId).delete(ws);
        if (clients.get(userId).size === 0) {
          clients.delete(userId);
        }
      }
      console.log(`用户 ${userId} 已断开WebSocket连接`);
    });
  });
  // 发送用户信息
  function sendUserInfo(ws, userId) {
    const user = users.find(u => u.id === userId);

    if (user) {
      const userInfo = {
        username: user.username,
        email: user.email
      };

      ws.send(JSON.stringify({
        type: 'userInfo',
        data: userInfo,
        timestamp: Date.now()
      }));
    } else {
      ws.send(JSON.stringify({
        type: 'error',
        message: '用户信息不存在',
        timestamp: Date.now()
      }));
    }
  }
  // 发送用户消息
  function sendNotification(userId, contentList) {
    const notification = {
      type: 'notification',
      contentList,
      timestamp: Date.now()
    };

    if (clients.has(userId)) {
      clients.get(userId).forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(notification));
        }
      });
    }
  }
  // 发送token过期通知-提前1s发送
  function sendUserTokenExpired(ws) {
    try {
      const decoded = jwt.verify(ws.token, 'your-secret-key');

      // 计算剩余有效时间（提前1秒通知）
      const expirationTime = decoded.exp * 1000; // 转换为毫秒
      const remainingTime = expirationTime - Date.now() - 1000;

      if (remainingTime > 0) {
        // 设置定时器在过期前1秒触发
        const expirationTimer = setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            // 生成新令牌（续期逻辑）
            const newToken = jwt.sign(
              { userId: decoded.userId },
              'your-secret-key',
              { expiresIn: '1h' }
            );

            // 发送新令牌给客户端
            ws.send(JSON.stringify({
              type: 'tokenRefresh',
              token: newToken,
              expireAt: Date.now() + 3600000 // 1小时有效期
            }));

            // 更新当前连接的令牌
            ws.token = newToken;
            // 重新设置过期检测
            sendUserTokenExpired(ws);
          }
        }, remainingTime);

        // 清理定时器
        ws.on('close', () => clearTimeout(expirationTimer));
      }
    } catch (error) {
      console.error('Token验证失败:', error);
      // 强制断开无效连接
      if (ws.readyState === WebSocket.OPEN) {
        // 发送强制登出指令
        ws.send(JSON.stringify({
          type: 'forceLogout',
          reason: error.name === 'TokenExpiredError' ? 'token_expired' : 'invalid_token',
          timestamp: Date.now()
        }));
        // 延迟1秒关闭确保消息送达-1008状态码表示policy violation
        setTimeout(() => ws.close(1008, 'Token expired'), 1000);
      }
    }
  }
  // 定期向所有用户广播通知的场景
  setInterval(() => {
    clients.forEach((userClients, userId) => {
      const newMessage = {
        type: 'notification',
        id: Date.now(),
        userId,
        content: '这是一条广播推送消息',
        timestamp: Date.now()
      };

      messages.push(newMessage);

      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(newMessage));
        }
      });
    });
  }, 1000 * 60 * 60); // 每小时推送一次消息

  return wss;
};    