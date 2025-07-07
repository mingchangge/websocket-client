import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VCalendar from 'v-calendar'
import VueAreaLinkage from 'vue-area-linkage'
import VueDOMPurifyHTML from 'vue-dompurify-html'
import { router } from './router'
import { store } from './store'
import "./style.css";
import App from "./App.vue";


Vue.use(ElementUI)
Vue.use(VCalendar)
Vue.use(VueAreaLinkage)
Vue.use(VueDOMPurifyHTML)
Vue.use(store)


const vm = new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
export { vm }
