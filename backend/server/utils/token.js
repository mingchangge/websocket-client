const jwt = require('jsonwebtoken');
// 集中管理密钥
const SECRETS = {
    access: 'access-token-secret',
    refresh: 'refresh-token-secret',
    fallback: 'your-fallback-secret'
};

class TokenBlacklist {
    constructor() {
        this.tokenMap = new Map();
    }

    add(token) {
        try {
            const decoded = jwt.decode(token);
            if (!decoded?.exp) return;
            this.tokenMap.set(token, decoded.exp * 1000);
        } catch (e) {
            console.error('添加黑名单失败:', e.message);
        }
    }
    has(token) {
        if (!token || typeof token !== 'string') {
            console.error('Invalid token format in blacklist check');
            return false;
        }

        const exists = this.tokenMap.has(token);
        if (exists) {
            const expireTime = this.tokenMap.get(token);
            if (Date.now() > expireTime) {
                this.tokenMap.delete(token);
                return false;
            }
            return true;
        }
        return false;
    }
    delete(token) {
        return this.tokenMap.delete(token);
    }
}
const tokenBlacklist = new TokenBlacklist();

module.exports = {
    // 抽象token生成逻辑
    _createToken(userId, tokenType, secret, expiresIn) {
        if (typeof userId !== 'number') {
            throw new Error('Invalid user ID type');
        }
        if (!['access', 'refresh'].includes(tokenType)) {
            throw new Error('Invalid token type');
        }
        const payload = {
            userId,
            tokenType,
            version: 'v1', // 添加版本控制字段
            iat: Math.floor(Date.now() / 1000)
        };
        return jwt.sign(
            payload,
            secret,
            { expiresIn }
        );
    },
    // 生成双Token
    generateTokens(userId) {
        return {
            accessToken: this._createToken(userId, 'access', SECRETS.access, '15m'),
            refreshToken: this._createToken(userId, 'refresh', SECRETS.refresh, '7d')
        };
    },

    refreshToken(refreshToken) {
        const decoded = this.verifyToken(refreshToken);
        if (decoded.tokenType !== 'refresh') {
            throw new Error('Invalid token type. Expected refresh token.');
        }
        return this._createToken(decoded.userId, 'access', SECRETS.access, '15m');
    },
    // 令牌吊销方法
    revokeToken(token, options = {}) {
        tokenBlacklist.add(token);
    },
    // 验证Token并自动分类
    verifyToken(token, options) {
        // 增加空值检查
        if (!token || typeof token !== 'string') {
            throw new Error('Invalid token format');
        }
        options = options || {
            algorithms: ['HS256'], // 指定允许的算法
            ignoreExpiration: false // 默认不忽略过期验证
        };
        // 新增secret参数和类型判断
        const secret = options.secret || this._determineSecret(token) || 'your-fallback-secret';
        try {
            const decoded = jwt.verify(token, secret, {
                ignoreExpiration: options.ignoreExpiration,
                algorithms: ['HS256']
            });
            // 增加必要属性检查
            if (!decoded?.userId) {
                throw new Error('Token missing userId claim');
            }

            return decoded;
        } catch (error) {
            console.error('Token验证失败详情:', error);
            throw error;
        }
    },
    // 黑名单管理
    tokenBlacklist,
    // 密钥判断私有方法
    _determineSecret(token) {
        try {
            const decoded = jwt.decode(token);
            return decoded?.tokenType === 'refresh'
                ? SECRETS.refresh
                : SECRETS.access;
        } catch {
            return SECRETS.fallback;
        }
    },
    // 错误类型
    TokenExpiredError: jwt.TokenExpiredError,
    JsonWebTokenError: jwt.JsonWebTokenError
};