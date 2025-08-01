const tokenService = require('../../utils/token');

// 认证失败响应
exports.handleAuthFailure = (request, socket, head, error) => {
    console.error(`Upgrade处理失败,用户认证失败: ${error}`);
    console.log('request:', request, 'head:', head);
    if (socket.readyState === 'open') {
        // 增加 head 参数安全处理
        try {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        } catch (writeError) {
            console.error('Failed to write response:', writeError.message);
        }
        socket.destroy();
    }

};

// Token验证逻辑
exports.authenticateToken = async (token) => {
    if (!token) throw { code: 4401, message: '缺少认证令牌' };

    try {
        const decoded = tokenService.verifyToken(token);
        // 增强解码结果验证
        if (!decoded?.userId) {
            throw new Error('Invalid token payload');
        }
        if (tokenService.tokenBlacklist.has(token)) {
            throw { code: 4403, message: '令牌已失效' };
        }
        return decoded;
    } catch (err) {
        console.error('认证失败完整上下文:', err);
        // 修正错误类型判断
        const isExpired = err instanceof tokenService.TokenExpiredError;
        const isInvalid = err instanceof tokenService.JsonWebTokenError;
        throw {
            code: isExpired ? 4402 : 4401,
            message: isExpired ? '令牌过期' : (isInvalid ? '无效令牌' : err.message),
            error: err
        };
    }
};