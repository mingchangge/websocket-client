import { defineStore } from 'pinia';
import WebSocketService from '@/utils/WebSocketService';
import { useUserStore } from './userStore';
import { useMessageStore } from './messageStore';
import { router } from '@/router'
import { eventBus } from '@/utils/eventBus'

export const useWebSocketStore = defineStore('websocketStore', {
    state: () => ({
        url: import.meta.env.VITE_WEBSOCKET_URL, // WebSocket服务器地址
        ws: null, // WebSocket实例
    }),
    actions: {
        // 新增初始化方法
        setupEventListeners() {
            // 安全检查
            if (typeof window === 'undefined') return;

            // 令牌刷新监听
            eventBus.on('token-refreshed', ({ token }) => {
                console.log('收到令牌刷新事件，重新连接WebSocket');
                this.initWebSocket(token);
            });

            // 登出事件监听
            eventBus.on('user-logout', () => {
                this.disconnect();
            });
        },
        initWebSocket(token) {
            // 如有WebSocket连接，先断开，在重新连接
            this.disconnect();
            const userStore = useUserStore();
            const messageStore = useMessageStore();
            this.ws = new WebSocketService({
                token: token,
                url: this.url,
                onMessage: (message) => this.handleMessage(message, userStore, messageStore),
                onClose: (event) => {
                    console.log('连接关闭详情:', event);
                    if (event.code === 1006) {
                        console.warn('异常断开，尝试刷新令牌');
                        userStore.refreshToken();
                    }
                },
                onError: (error) => console.error('WebSocket错误:', error),
                onForceLogout: (reason) => this.handleLogout(reason) // 新增强制退出回调
            })
            this.ws.connect()
        },

        handleMessage(message, userStore, messageStore) {
            try {
                const data = JSON.parse(message.data);
                console.log('收到WebSocket消息:', data);
                switch (data.type) {
                    case 'userInfo':
                        userStore.setUserInfo(data.data);
                        break;
                    case 'notification':
                        messageStore.setMessagesList(data.contentList);
                        break;
                    case 'system':
                        console.log('系统消息:', data.content);
                        break;
                    case 'tokenRefresh':
                        console.log('Token已刷新');
                        userStore.setToken(data.token) // 仅更新内存
                        console.log('重新WebSocket建立连接')
                        this.initWebSocket(data.token);
                        console.log('WebSocket连接已建立');
                        break;
                    case 'forceLogout':
                        console.warn('强制登出:', data.reason);
                        this.handleLogout(data);
                        break;
                    default:
                        console.log('未知类型消息:', data);
                }
            } catch (error) {
                console.error('消息处理失败:', {
                    error: error.message,
                    rawData: message.data // 记录原始数据
                });

                // 触发错误回调
                if (this.ws?.onError) {
                    this.ws.onError({
                        type: 'MessageProcessingError',
                        error
                    });
                }
            }
        },

        // 断开WebSocket连接
        disconnect() {
            if (!this.ws) return
            this.ws.disconnect();
            this.ws = null;
            this.userInfo = {};
            this.messagesList = [];
            console.log('WebSocket连接已断开');
        },

        sendMessage(data) {
            if (this.ws && this.isConnected) {
                this.ws.send(JSON.stringify(data));
            } else {
                console.error('无法发送消息: WebSocket未连接');
            }
        },
        // 新增处理方法
        handleLogout(reason) {
            try {
                const data = typeof reason === 'string' ? JSON.parse(reason) : reason;
                console.warn('强制登出:', data.message || '未知原因');

                // 统一清理逻辑
                this.disconnect();
                const userStore = useUserStore();
                userStore.logout(data); // 触发用户存储清理

                // 路由跳转（需要引入路由实例）
                router.push({ path: '/login' });
            } catch (e) {
                console.error('强制登出处理异常:', e);
            }
        }
    }
});    