// 心跳检测控制器
module.exports.createHeartbeatController = (ws, HEARTBEAT_INTERVAL) => {
    let lastActive = Date.now();
    let heartbeatTimer = null;

    const checkAlive = () => {
        if (Date.now() - lastActive > HEARTBEAT_INTERVAL * 2) {
            ws.close(1001, 'No heartbeat response');
        }
    };

    return {
        start: () => {
            heartbeatTimer = setInterval(checkAlive, HEARTBEAT_INTERVAL);
            // 处理标准ping/pong
            ws.on('pong', () => lastActive = Date.now());
            // 处理文本消息ping
            ws.on('message', message => {
                if (message.toString() === 'ping') {
                    lastActive = Date.now();
                    ws.send('pong');
                }
            });
        },
        stop: () => {
            if (heartbeatTimer) {
                clearInterval(heartbeatTimer);
                heartbeatTimer = null;
            }
        },
        updateActivity: () => lastActive = Date.now()
    };
}