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
function parseTokenFromUrl(url) {
  try {
    const parsedUrl = new URL(url, 'http://localhost');
    const token = parsedUrl.searchParams.get('token');
    return token ? decodeURIComponent(token) : null;
  } catch (error) {
    console.error('解析WebSocket URL失败:', error);
    return null;
  }
}
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
    const token = parseTokenFromUrl(request.url);
    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    try {
      const decoded = jwt.verify(token, 'your-secret-key');
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, decoded.userId); // 传递解码后的用户ID
      });
    } catch (error) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });
  // 处理WebSocket连接
  wss.on('connection', (ws, userId) => {
    console.log('WebSocket 连接已建立', userId);
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
  // 模拟推送消息（仅广播通知类消息）
  setInterval(() => {
    clients.forEach((userClients, userId) => {
      const newMessage = {
        id: Date.now(),
        userId,
        content: '这是一条推送消息',
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