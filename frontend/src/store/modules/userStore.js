import { defineStore } from 'pinia';
import { common } from '@/api/common'
import { Message } from 'element-ui'
import { router } from '@/router'

export const useUserStore = defineStore('userStore', {
    state: () => ({
        userInfo: {}
    }),
    actions: {
        setUserInfo(info) {
            this.userInfo = info;
        },
        logout() {
            common
                .logoutApi()
                .then(() => {
                    Message({
                        message: '退出登录成功!',
                        type: 'success'
                    })
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
                        module.useWebSocketStore().disconnect()
                    })
                })
            console.log('退出登录')
        }
    }
});