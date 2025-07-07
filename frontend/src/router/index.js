import Vue from 'vue'
import VueRouter from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'


Vue.use(VueRouter)
//添加以下代码
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

/**
 * @type {import('vue-router').RouteConfig[]}
 */
const routes = [
  {
    path: '/login',
    component: () => import('@/views/login-page')
  },
  {
    path: '/',
    component: BaseLayout,
    redirect: '/home',
    children: [{
      path: 'home',
      component: () => import('@/views/home-page'),
      meta: { title: '首页', hidden: false },
      children: []
    },]
  },
  {
    path: '*', redirect: '/login', hidden: true
  }

]

export const router = new VueRouter({
  mode: 'hash', //history
  routes
})
