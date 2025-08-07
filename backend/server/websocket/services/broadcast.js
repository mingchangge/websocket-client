// 定期向所有用户广播通知的场景
module.exports = {
    startBroadcast(clients, messages) {
        setInterval(() => {
            clients.forEach((userClients, userId) => {
                const newMessage = {
                    type: 'broadcast',
                    id: Date.now(),
                    userId,
                    content: '这是一条广播推送消息',
                    timestamp: Date.now()
                };

                messages.push(newMessage);

                userClients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(newMessage));
                    }
                });
            });
        }, 1000 * 60 * 1); // 每小时推送一次消息
    }
}