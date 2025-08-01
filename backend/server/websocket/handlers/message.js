// 消息处理器
module.exports.handleMessage = (ws, heartbeat, userId, message) => {
    heartbeat.updateActivity();
    console.log(`收到来自用户 ${userId} 的消息: ${message}`);
    // 这里可以处理客户端发送的消息
}