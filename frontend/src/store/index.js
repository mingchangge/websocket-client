import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'

Vue.use(PiniaVuePlugin)

export const store = createPinia()


export * from './modules/electronTab'
export * from './modules/websocketStore'
export * from './modules/userStore'
export * from './modules/messageStore'
