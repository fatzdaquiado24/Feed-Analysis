import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vuetify from 'vuetify'
import themeConfig from './themeConfig'
import VueOnToast from 'vue-on-toast'
import VeeValidate from 'vee-validate'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vue-on-toast/dist/vue-on-toast.css'
import 'vuetify/dist/vuetify.min.css'
import './axios'

Vue.use(Vuetify, themeConfig)
Vue.use(VueOnToast)
Vue.use(VeeValidate)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
