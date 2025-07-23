import { defineStore } from 'pinia';
import WebSocketService from '@/utils/WebSocketService';
import { useUserStore } from './userStore';
import { useMessageStore } from './messageStore';
import { router } from '@/router'

export const useWebSocketStore = defineStore('websocketStore', {
    state: () => ({
        url: import.meta.env.VITE_WEBSOCKET_URL, // WebSocket服务器地址
        ws: null, // WebSocket实例
    }),
    actions: {
        initWebSocket(token) {
            // 如有WebSocket连接，先断开，在重新连接
            this.disconnect();
            const userStore = useUserStore();
            const messageStore = useMessageStore();
            this.ws = new WebSocketService({
                token: token,
                url: this.url,
                onMessage: (message) => this.handleMessage(message, userStore, messageStore),
                onClose: () => this.disconnect(),
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
                        userStore.setToken(data.token);
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
                console.error('解析WebSocket消息失败:', error);
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