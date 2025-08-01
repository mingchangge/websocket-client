const { handleAuthFailure, authenticateToken } = require('./auth');

exports.handleUpgrade = (wss) => async (request, socket, head) => {
    // 增加参数完整性检查
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    try {
        const decoded = await authenticateToken(token);
        // 添加更严格的状态检查
        if (socket.readyState !== 'open' || socket.destroyed || socket.closed) {
            throw new Error(`Socket closed before upgrade | State: ${socket.readyState}`);
        }

        // 同步处理
        wss.handleUpgrade(request, socket, head, ws => {
            // 添加连接状态双重验证
            if (ws.readyState === WebSocket.OPEN && socket.readyState === 'open') {
                wss.emit('connection', ws, { userId: decoded.userId, token });
            } else {
                socket.destroy();
            }
        });

    } catch (error) {
        handleAuthFailure(request, socket, head, error);
    }
};