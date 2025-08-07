import axios from 'axios'
import Vue from 'vue'
import { Message } from 'element-ui'
import { useUserStore } from '@/store'
import { router } from '@/router'
import { common } from '@/api/common'

const services = axios.create({
  baseURL:
    import.meta.env.DEV
      ? '/api' // 开发环境走代理
      : import.meta.env.VITE_API_URL, // 生产环境用实际地址
  // 请求超时时间---60秒
  timeout: 60000,
  withCredentials: true  // 允许携带跨域Cookie
})
// 在 axios.create() 之后添加
console.log('[ENV]', {
  DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
  API_URL: import.meta.env.VITE_API_URL,
  PORT: import.meta.env.VITE_PORT
})
// 请求拦截
services.interceptors.request.use(
  config => {
    /**
     * 在这里一般会携带前台的参数发送给后台
     */
    const userStore = useUserStore()
    if (userStore.accessToken && !config.url.includes('/refresh_token')) {
      config.headers['Authorization'] = `Bearer ${userStore.accessToken}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

var logError = {
  count: 0,
  time: 0,
  error: ''
}

// 响应拦截
services.interceptors.response.use(
  response => {
    const res = response.data
    /**
     * 这里使用的是自定义 Code 码来做统一的错误处理
     * code 等于 -1 则代表接口响应出错（可根据自己的业务来进行修改）
     */
    // res.code === '222222' ===> 通用错误
    if (res.code === '222222') {
      Vue.prototype
        .$msgbox({
          title: '提示',
          message: res.desc,
          type: 'warning',
          confirmButtonText: '确定'
        })
        .then(res => {
          console.log(res)
        })
        .catch(res => {
          console.log(res)
        })
      return Promise.reject(res.desc)
    }
    if (
      res.code &&
      res.code !== 200 &&
      res.code !== '000000' &&
      res.code !== '222222' &&
      res.code !== '500006' &&
      res.code !== ''
    ) {
      const msg = res.message || res.desc || '未知错误，请联系管理员查看'
      const now = new Date().getTime()
      if (now - logError.time > 3000 || logError.error !== msg) {
        Message({
          message:
            res.code === '300010' || res.code === '500021'
              ? `${msg}，您将被强制返回登录页面`
              : msg,
          type: 'error'
        })

        logError.count++
        logError.time = new Date().getTime()
        logError.error = msg
      }
      console.error('[api]', msg)
      return Promise.reject(msg)
    }

    return res
  },
  async error => {
    const { response } = error
    const originalRequest = error.config
    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        // 自动刷新token
        const userStore = useUserStore()
        // 等待刷新结果并判断是否成功
        const refreshSuccess = await userStore.refreshToken()
        if (refreshSuccess) {
          originalRequest.headers.Authorization = `Bearer ${userStore.accessToken}`
          return services(originalRequest)
        } else {
          // 刷新失败直接跳转登录，不重试请求
          userStore.clearHistory()
          router.push('/login')
          return Promise.reject(new Error('令牌刷新失败'))
        }
      } catch (refreshError) {
        userStore.clearHistory()
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default services