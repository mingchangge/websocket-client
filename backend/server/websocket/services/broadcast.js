const { broadcast_messages } = require('../../storage/db');

// 定期向所有用户广播通知的场景
module.exports = {
    startBroadcast(clients, messages) {
        setInterval(() => {
            clients.forEach((userClients, userId) => {
                const newMessage = {
                    type: 'notification',
                    id: Date.now(),
                    userId,
                    content: '这是一条广播推送消息',
                    timestamp: Date.now()
                };

                broadcast_messages.push(newMessage);

                userClients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(newMessage));
                    }
                });
            });
        }, 1000 * 60 * 60); // 每小时推送一次消息
    }
}