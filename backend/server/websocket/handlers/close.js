const { removeClient } = require('../../storage/db');
// 关闭处理器
module.exports.handleClose = (ws, heartbeat, userId,) => {
    heartbeat.stop();
    removeClient(userId, ws);
    console.log(`用户 ${userId} 已断开WebSocket连接`);
};