class WebSocketService {
    constructor(options) {
        this.url = options.url;
        this.token = options.token; // 新增token参数
        this.forceLogout = false; // 新增强制退出标志
        // 回调函数
        this.onMessage = options.onMessage;
        this.onClose = options.onClose;
        this.onError = options.onError;
        this.onForceLogout = options.onForceLogout;
        this.socket = null;
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 600000; // 10 分钟
    }
    // 初始化连接方法
    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
            return;
        }
        // 对token进行URL编码，防止特殊字符导致协议错误
        const encodedUrl = this._buildSafeWebSocketUrl();
        console.log('Connecting to:', encodedUrl); // 添加调试日志
        this.socket = new WebSocket(encodedUrl);

        this.socket.onopen = () => {
            console.log('WebSocket 连接已建立');
            this.reconnectAttempts = 0;
        };

        this.socket.onmessage = this.onMessage;

        this.socket.onclose = (event) => {
            console.log(`WebSocket 关闭，代码: ${event.code}，原因: ${event.reason}`);

            // 新增关闭代码解析
            if (event.code === 4401) {
                try {
                    const reason = JSON.parse(event.reason);
                    if (reason.type === 'forceLogout') {
                        console.warn('强制退出:', reason.message);
                        this.onForceLogout?.(event.reason); // 调用强制退出回调
                        this.forceLogout = true; // 设置强制退出标志
                        this.socket = null; // 立即释放连接
                        return;
                    }
                } catch (e) {
                    console.error('解析关闭原因失败:', e);
                }
            }

            // 原有重连逻辑
            if (!this.forceLogout) {
                this.handleReconnect();
                console.log('WebSocket 连接已关闭，准备重连');
            }
            this.onClose?.();
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
        const urlObj = new URL(this.url);
        if (this.token) {
            urlObj.searchParams.set('token', this.token);
        }
        return urlObj.toString();
    }
    // 断开连接方法
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.socket) {
            this.socket.onclose = null;
            this.socket.close();
            this.socket = null;
        }
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
        if (this.forceLogout) {
            console.log('强制退出状态，禁止重连');
            return;
        }
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectTimer = setTimeout(() => {
                this.reconnectAttempts++;
                console.log(`尝试重连 WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connect();
            }, this.reconnectInterval);
        } else {
            console.error('达到最大重连次数，停止尝试');
        }
    }
}

export default WebSocketService;