const WebSocket = require('ws');
const { handleUpgrade } = require('./handlers/upgrade');

//connection方法导入
const { createHeartbeatController } = require('./controllers/heartbeat');
const { handleMessage } = require('./handlers/message');
const { handleClose } = require('./handlers/close');
const { handleError } = require('./handlers/error');
const { initializeServices } = require('./services/initializer');
const { startBroadcast } = require('./services/broadcast');

//数据导入
const { broadcast_messages, clients, addClient } = require('../storage/db');



function setupWebSocket(server) {
  const wss = new WebSocket.Server({
    noServer: true,
    perMessageDeflate: false, // 强制禁用压缩
    clientTracking: true,
    maxPayload: 1048576
  });
  // 处理升级请求
  server.on('upgrade', (request, socket, head) => {
    return handleUpgrade(wss)(request, socket, head)
  });
  // 处理WebSocket连接
  wss.on('connection', handleConnection);
  // 处理连接
  function handleConnection(ws, { userId, token }) {
    ws.token = token;
    console.log('WebSocket 连接已建立', userId);
    // 参数化心跳间隔-30秒检测一次
    const heartbeat = createHeartbeatController(ws, 30000);

    // 初始化客户端映射
    addClient(userId, ws);

    // 初始化业务逻辑
    initializeServices(ws, userId);
    heartbeat.start();

    // 使用统一的事件绑定方法
    bindEventHandlers(ws, heartbeat, userId);
  }
  // 新增统一事件绑定方法
  function bindEventHandlers(ws, heartbeat, userId) {
    const handlers = {
      message: (message) => handleMessage(ws, heartbeat, userId, message),
      close: () => handleClose(ws, heartbeat, userId),
      error: () => handleError(ws, heartbeat, userId)
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      ws.on(event, handler);
    });
  }
  // 启动广播服务
  startBroadcast(clients, broadcast_messages);
  return wss;
};
module.exports = setupWebSocket;