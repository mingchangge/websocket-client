import { defineStore } from 'pinia';
import { common } from '@/api/common'
import { Message } from 'element-ui'
import { eventBus } from '@/utils/eventBus';

export const useUserStore = defineStore('userStore', {
    state: () => ({
        isRefreshing: false, // 添加刷新锁
        userInfo: {},
        accessToken: null // 内存存储AccessToken
    }),
    getters: {
        isLogin() {
            return !!this.accessToken || !!localStorage.getItem('accessToken')
        },
        useToken() {
            return this.accessToken || localStorage.getItem('accessToken')
        }
    },
    actions: {
        setToken(token) {
            this.accessToken = token
            localStorage.setItem('accessToken', token)
        },
        async refreshToken() {
            if (this.isRefreshing) return Promise.reject('正在刷新令牌中');
            try {
                this.isRefreshing = true;
                const response = await common.refreshTokenApi();
                if (!response || !response.data || !response.data.access_token) {
                    throw new Error('刷新令牌响应格式不正确');
                }
                console.log('刷新令牌成功-------------------:', response);
                this.setToken(response.data.access_token);
                localStorage.setItem('accessToken', response.data.access_token);
                // 通过事件总线通知
                eventBus.emit('token-updated', response.data.access_token);
                return true;
            } catch (error) {
                console.error('令牌刷新失败------------------------:', error);
                this.logout({ code: 'TOKEN_EXPIRED', message: '令牌已过期，请重新登录' });
                return Promise.reject(error);
            } finally {
                this.isRefreshing = false;
            }
        },
        setUserInfo(info) {
            this.userInfo = info;
        },
        // 处理敏感操作前的token验证
        async handleSensitiveOperation() {
            try {
                // 重要操作前主动获取最新token
                const latestToken = localStorage.getItem('token');

                // 使用新token发起请求
                const response = await axios.post('/api/change-password', {
                    newPassword: '******'
                }, {
                    headers: {
                        Authorization: `Bearer ${latestToken}`
                    }
                });

                if (response.data.code === '000000') {
                    this.$message.success('操作成功');
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    this.$message.error('会话已过期，请重新登录');
                    this.logout();
                }
            }
        },
        logout(reason) {
            if (!reason.code === 'USER_LOGOUT') {
                this.clearHistory(); //data.message
                Message({
                    message: messages[reason.code] || '登录状态异常，请重新登录',
                    type: 'error'
                })
                return;
            }
            // 用户登出逻辑
            common
                .logoutApi()
                .then(() => {
                    Message({
                        message: '退出登录成功!',
                        type: 'success'
                    })
                }).catch(error => {
                    // 特殊处理401错误
                    if (error.response?.status === 401) {
                        Message.error('会话已过期，自动退出')
                    }
                })
                .finally(() => {
                    this.clearHistory();
                })
            console.log('退出登录')
        },
        clearHistory() {
            //清空store里的所有内容
            this.$reset()
            localStorage.removeItem('accessToken')
        }
    }
});