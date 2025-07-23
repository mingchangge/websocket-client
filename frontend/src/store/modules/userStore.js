import { defineStore } from 'pinia';
import { common } from '@/api/common'
import { Message } from 'element-ui'
import { router } from '@/router'

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
            const messages = {
                'token_expired': '登录已过期，请重新登录',
                'invalid_token': '登录状态异常，请重新登录'
            };
            common
                .logoutApi()
                .then(() => {
                    if (reason) {
                        Message({
                            message: messages[reason] || '登录状态异常，请重新登录',
                            type: 'success'
                        });
                    } else {
                        Message({
                            message: '退出登录成功!',
                            type: 'success'
                        })
                    }
                })
                .catch(error => {
                    console.error('退出登录失败:', error)
                    Message({
                        message: '退出登录失败，即将强制退出!',
                        type: 'error'
                    })
                })
                .finally(() => {
                    localStorage.removeItem('token')
                    router.push('/login')
                    //清空store里的所有内容
                    this.$reset()
                    import('@/store/modules/websocketStore').then(module => {
                        module.useWebSocketStore().handleForceLogout()
                    })
                })
            console.log('退出登录')
        }
    }
});