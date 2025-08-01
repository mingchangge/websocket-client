// 客户端管理方法
const clientManager = {
    // 客户端连接池（使用Map存储）
    clients: new Map(),
    // 新增方法
    addClient(userId, ws) {
        // 添加空值检查和初始化
        if (!this.clients) {
            this.clients = new Map();
        }

        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }

        // 新增：获取当前连接的前一个有效连接
        const previousConnection = Array.from(this.clients.get(userId))
            .find(client => client !== ws && client.readyState === WebSocket.OPEN);

        // 关闭前一个活跃连接（如果存在）
        if (previousConnection) {
            previousConnection.close(1000, 'connection_replaced'); // 正常关闭代码
            this.removeClient(userId, previousConnection);
        }

        this.clients.get(userId).add(ws);

        ws.on('close', () => {
            this.removeClient(userId, ws);
        });
    },
    // 移除客户端连接
    removeClient(userId, ws) {
        if (this.clients?.has(userId)) {
            // 从集合中删除指定连接
            this.clients.get(userId).delete(ws);
            if (this.clients.get(userId).size === 0) {
                // 清理空集合
                this.clients.delete(userId);
            }
        }
    },
    // 单个用户的多设备/多连接进行消息广播
    sendToUser(userId, message) {
        if (this.clients?.has(userId)) {
            this.clients.get(userId).forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    },
    // 一对一发送方法
    sendToClient(userId, ws, message) {
        if (this.clients?.has(userId) &&
            this.clients.get(userId).has(ws) &&
            ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    },
    // 一对一发送（当前连接）
    handlePrivateMessage(ws, userId, message) {
        clientManager.sendToClient(userId, ws, {
            type: 'private',
            content: message,
            timestamp: Date.now()
        });
    },
};
module.exports = {
    // 用户数据存储
    users: [
        { id: 1, username: 'admin', password: 'password', email: 'admin@example.com' },
        { id: 2, username: 'user1', password: '123456', email: 'user1@example.com' },
        { id: 3, username: 'user2', password: '123456', email: 'user2@example.com' },
    ],
    // 消息存储（使用数组模拟数据库）
    messages: [],
    // 客户端连接池
    clients: clientManager.clients,
    addClient: clientManager.addClient.bind(clientManager),
    removeClient: clientManager.removeClient.bind(clientManager),
    sendToUser: clientManager.sendToUser.bind(clientManager),
    // 新增通用访问方法
    getUsers: () => this.users,
    addMessage: (msg) => this.messages.push(msg)
};

