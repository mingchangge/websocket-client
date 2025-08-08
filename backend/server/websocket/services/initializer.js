const tokenService = require('../../utils/token');
const { users, sendToUser } = require('../../storage/db');

module.exports.initializeServices = (ws, userId) => {
    sendWelcomeMessage(ws);
    sendUserInfo(ws, userId);
    const contentList = [{
        id: 4,
        userId: 1,
        content: '这是一条推送消息1',
        timestamp: Date.now(),
    }, {
        id: 3,
        userId: 1,
        content: '您有新的通知2',
        timestamp: Date.now() - 1800000 // 30分钟前
    }, {
        id: 2,
        userId: 1,
        content: '您有新的通知3',
        timestamp: Date.now() - 3600000 // 1小时前
    }, {
        id: 1,
        userId: 1,
        content: '欢迎使用系统',
        timestamp: Date.now() - 3600000 // 1小时前
    }]
    sendNotification(userId, contentList);
    sendUserTokenExpired(ws);
}
// 发送欢迎消息
function sendWelcomeMessage(ws) {
    ws.send(JSON.stringify({
        content: '欢迎使用系统,WebSocket 连接已建立!',
        timestamp: Date.now()
    }));
}
// 发送用户信息
function sendUserInfo(ws, userId) {
    const user = users.find(u => u.id === userId);

    if (user) {
        const userInfo = {
            username: user.username,
            email: user.email
        };

        ws.send(JSON.stringify({
            type: 'userInfo',
            data: userInfo,
            timestamp: Date.now()
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            message: '用户信息不存在',
            timestamp: Date.now()
        }));
    }
}
// 发送用户消息
function sendNotification(userId, contentList) {
    const notification = {
        type: 'notification',
        contentList,
        timestamp: Date.now()
    };
    sendToUser(userId, notification);
}
// 发送token过期通知-提前1s发送
function sendUserTokenExpired(ws) {
    try {
        const decoded = tokenService.verifyToken(ws.token);

        // 计算剩余有效时间（提前1秒通知）
        const expirationTime = decoded.exp * 1000; // 转换为毫秒
        const remainingTime = expirationTime - Date.now() - 1000;

        if (remainingTime > 0) {
            // 设置定时器在过期前1秒触发
            const expirationTimer = setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    // 发送令牌过期预警，要求客户端使用refresh token获取新access token
                    ws.send(JSON.stringify({
                        type: 'tokenRefresh',
                        message: 'Access token即将过期，请发送refreshTokenRequest获取新token',
                        expireAt: expirationTime
                    }));
                    // 设置5秒刷新等待期 -重新设置过期检测
                    const refreshWaitTimer = setTimeout(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'forceLogout',
                                reason: 'token_expired',
                                timestamp: Date.now()
                            }));
                            setTimeout(() => ws.close(1008, 'Token expired'), 1000);
                            console.warn('令牌过期强制登出:', ws.token);
                        }
                    }, 5000);
                    ws.refreshWaitTimer = refreshWaitTimer;
                    ws.on('close', () => clearTimeout(refreshWaitTimer));
                }
            }, remainingTime);

            // 清理定时器
            ws.on('close', () => clearTimeout(expirationTimer));
        } else {
            // 强制断开无效连接
            if (ws.readyState === WebSocket.OPEN) {
                // 发送强制登出指令
                ws.send(JSON.stringify({
                    type: 'forceLogout',
                    reason: 'invalid_token',
                    timestamp: Date.now()
                }));
                // 延迟1秒关闭确保消息送达
                setTimeout(() => ws.close(1008, 'Token expired'), 1000);
                console.warn('令牌过期强制登出:', ws.token);
                // 过期令牌的特殊处理示例，一般情况下也就是强制退出了
                // TokenExpiredHandler(ws, decoded, error)
            }
        }
    } catch (error) {
        console.error('Token验证失败:', error);
        // 强制断开无效连接
        if (ws.readyState === WebSocket.OPEN) {
            // 发送强制登出指令
            ws.send(JSON.stringify({
                type: 'forceLogout',
                reason: error.name === 'TokenExpiredError' ? 'token_expired' : 'invalid_token',
                timestamp: Date.now()
            }));
            // 延迟1秒关闭确保消息送达-1008状态码表示policy violation
            setTimeout(() => ws.close(1008, 'Token expired'), 1000);
        }
    }

    function TokenExpiredHandler(ws, decoded, error) {
        // 1. 记录详细审计日志
        console.warn(`[SECURITY] 用户令牌过期，用户ID: ${decoded?.userId}`, {
            expiredAt: error.expiredAt.toISOString(),
            lastActivity: ws.lastActivity
        });

        // 2. 清理关联的会话数据
        cleanupSessionData(decoded.userId);

        // 3. 发送强制重新登录指令
        ws.send(JSON.stringify({
            type: 'sessionExpired',
            code: 'SESSION_401',
            redirectUrl: '/login?expired=true'
        }));

        // 4. 执行安全措施（示例）
        securityService.logSuspiciousActivity({
            type: 'expired_token_reuse',
            userId: decoded?.userId,
            token: ws.token
        });
    }
}