const tokenService = require('../../utils/token');
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
        const data = JSON.parse(message);

        // 处理刷新令牌请求
        if (data.type === 'refreshTokenRequest') {
            const newAccessToken = tokenService.refreshToken(data.refreshToken);
            ws.send(JSON.stringify({
                type: 'tokenRefreshSuccess',
                accessToken: newAccessToken,
                expireAt: Date.now() + 300000 // 5分钟有效期
            }));
            return;
        }
    } catch (error) {
        console.error('处理消息错误:', error);
        ws.send(JSON.stringify({
            type: 'error',
            code: 'MESSAGE_PROCESSING_ERROR',
            message: error.message
        }));
    }
}