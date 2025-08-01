// 抽象错误处理器
module.exports.handleError = (ws, heartbeat, error) => {
    console.error('WebSocket error:', error);
    heartbeat.stop();
    ws.close(1011, 'Server Error');
}