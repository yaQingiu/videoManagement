import { createApp } from 'vue'
// import store from './store/store1'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import "./api/permission"
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import uploader from 'vue-simple-uploader'

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // 注册持久化插件

createApp(App)
  .use(router)
  .use(ElementPlus, {
    locale: zhCn, // 在这里配置国际化
  })
  .use(pinia)
  .use(uploader)
  .mount('#app')
