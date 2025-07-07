import request from '@/utils/request'

export const common = {
    loginApi: (data) => {
        return request({
            url: '/login',
            method: 'post',
            data
        })
    },
    logoutApi: () => {
        return request({
            url: '/logout',
            method: 'post'
        })
    },
}