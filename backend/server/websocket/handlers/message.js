// 消息处理器
module.exports.handleMessage = (ws, heartbeat, userId, message) => {
    heartbeat.updateActivity();
    console.log(`收到来自用户 ${userId} 的消息: ${message}`);
    // 处理客户端发送的消息
    try {
        // 处理非JSON格式的ping消息
        if (message.trim() === 'ping') {
            // 回复pong
            ws.send('pong');
            return;
        }
        // 回复客户端
        ws.send(message);
    } catch (error) {
        console.error('处理消息错误:', error);
        ws.send(JSON.stringify({
            type: 'error',
            code: 'MESSAGE_PROCESSING_ERROR',
            message: error.message
        }));
    }
}