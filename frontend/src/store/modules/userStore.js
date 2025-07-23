import { defineStore } from 'pinia';
import { common } from '@/api/common'
import { Message } from 'element-ui'


export const useUserStore = defineStore('userStore', {
    state: () => ({
        userInfo: {},
    }),
    getters: {
        isLogin() {
            return localStorage.getItem('token') !== null
        },
        useToken() {
            return localStorage.getItem('token')
        }
    },
    actions: {
        setToken(token) {
            localStorage.setItem('token', token)
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
            localStorage.removeItem('token')
            //清空store里的所有内容
            this.$reset()
        }
    }
});