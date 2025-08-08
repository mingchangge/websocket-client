import { useUserStore } from '@/store'
import { eventBus } from '@/utils/eventBus'

class WebSocketService {
    constructor(options) {
        this.url = options.url;
        // 移除未使用的options.token参数
        this.forceLogout = false;
        // 回调函数
        this.onMessage = options.onMessage;
        this.onClose = (event) => options.onClose?.(event);
        this.onError = options.onError;
        this.onForceLogout = options.onForceLogout;
        this.socket = null;
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 600000; // 10 分钟
        this.isManualDisconnect = false;
        this.heartbeatInterval = 30000; // 心跳间隔30秒
        this.heartbeatTimeout = 60000;   // 心跳超时60秒
        this.heartbeatTimer = null;     // 心跳定时器
        this.pongTimeout = null;        // 响应超时检测
        // 监听token更新事件
        this.tokenUpdatedListener = (newToken) => {
            this.token = newToken;
            const oldSocket = this.socket;
            oldSocket.onclose = () => {
                if (this.socket === oldSocket) {
                    this.socket = null;
                    this.connect();
                }
            };
            if (oldSocket.readyState === WebSocket.OPEN) {
                oldSocket.close(1000, 'Token updated');
            }
        };
        eventBus.on('token-updated', this.tokenUpdatedListener);
        // 登出事件监听
        eventBus.on('user-logout', () => {
            this.disconnect();
        });
    }
    // 初始化连接方法
    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
            return;
        }
        const userStore = useUserStore();
        this.token = userStore.useToken;
        this.isManualDisconnect = false;
        // 对token进行URL编码，防止特殊字符导致协议错误
        const encodedUrl = this._buildSafeWebSocketUrl();
        this.socket = new WebSocket(encodedUrl);
        // 新增握手超时机制（15秒）
        const connectTimeout = setTimeout(() => {
            if (this.socket.readyState === WebSocket.CONNECTING) {
                console.error('WebSocket连接超时');
                this.socket.close(1002, 'Connection timeout');
            }
        }, 15000);
        this.socket.onopen = () => {
            clearTimeout(connectTimeout);
            this.reconnectAttempts = 0;
            this._startHeartbeat();
        };

        this.socket.onmessage = (event) => {  // 修改：增加心跳处理
            // 处理心跳响应
            if (event.data === 'pong') {
                this._resetPongTimeout();
                return;
            }
            // 原有消息处理
            this.onMessage(event);
        };

        this.socket.onclose = (event) => {
            clearTimeout(connectTimeout);
            this._clearHeartbeat();
            if (event.code === 4401) {
                try {
                    const reason = JSON.parse(event.reason);
                    if (reason.type === 'forceLogout') {
                        this.onForceLogout?.(event.reason);
                        this.forceLogout = true;
                        this.socket = null;
                        return;
                    }
                } catch (e) {
                    console.error('解析关闭原因失败:', e);
                }
            }

            // 原有重连逻辑
            if (!this.forceLogout) {
                this.scheduleReconnect();
            }
            this.onClose?.(event);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket 错误详情:', {
                type: error.type,
                message: error.message,
                readyState: this.socket?.readyState
            });
            this.onError(error);
            this.socket.close();
        };
    }
    // 新增方法：安全构建WebSocket URL
    _buildSafeWebSocketUrl() {
        // 增加 URL 有效性检查
        if (!this.url.startsWith('ws://') && !this.url.startsWith('wss://')) {
            throw new Error(`Invalid WebSocket protocol: ${this.url}`);
        }
        try {
            const urlObj = new URL(this.url);
            urlObj.searchParams.set('token', encodeURIComponent(this.token || ''));
            return urlObj.toString();
        } catch (error) {
            console.error('Invalid WebSocket URL:', error);
            throw new Error('Invalid WebSocket URL format');
        }
    }
    // 心跳检测私有方法
    _startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send('ping');
                this._resetPongTimeout();
            }
        }, this.heartbeatInterval);
    }

    _resetPongTimeout() {
        clearTimeout(this.pongTimeout);
        this.pongTimeout = setTimeout(() => {
            console.error('心跳响应超时，主动断开连接');
            this.socket?.close(4008, 'Heartbeat timeout');
        }, this.heartbeatTimeout);
    }

    _clearHeartbeat() {
        clearInterval(this.heartbeatTimer);
        clearTimeout(this.pongTimeout);
        this.heartbeatTimer = null;
        this.pongTimeout = null;
    }
    // 断开连接方法
    disconnect() {
        this._clearHeartbeat();
        this.isManualDisconnect = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.socket) {
            this.socket.onclose = null;
            this.socket.close(1000, 'manual_disconnect');
            this.socket = null;
        }
        eventBus.off('token-updated', this.tokenUpdatedListener);
    }

    // 发送消息方法
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        } else {
            console.error('无法发送消息: WebSocket 连接未打开');
        }
    }

    // 重连方法,如果重连次数超过最大限制，则停止尝试
    scheduleReconnect() {
        if (this.forceLogout || this.isManualDisconnect) {
            // 移除调试日志
            return;
        }
        // 动态调整重试间隔（指数退避）
        const baseInterval = 5000; // 5秒基准
        const retryDelay = Math.min(
            baseInterval * Math.pow(2, this.reconnectAttempts),
            this.reconnectInterval
        );
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectTimer = setTimeout(() => {
                this.reconnectAttempts++;
                console.log(`第${this.reconnectAttempts}次重试，间隔${retryDelay}ms`);
                this.connect();
            }, retryDelay);
        } else {
            console.error('达到最大重连次数，停止尝试');
        }
    }
}

export default WebSocketService;