import Vue from "vue";
import App from "@/App";
// import router from "@/router"; // api: https://github.com/vuejs/vue-router
import router from "@/route"; // api: https://github.com/vuejs/vue-router
import store from "@/store"; // api: https://github.com/vuejs/vuex
import VueCookie from "vue-cookie"; // api: https://github.com/alfhen/vue-cookie
import "@/element-ui"; // api: https://github.com/ElemeFE/element
import "@/icons"; // api: http://www.iconfont.cn/
import "@/element-ui-theme";
import "@/assets/scss/index.scss";
import httpRequest from "@/utils/httpRequest"; // api: https://github.com/axios/axios
import { isAuth } from "@/utils";
import cloneDeep from "lodash/cloneDeep";
import tools from "@/utils/tools";
import md5 from "js-md5";
Vue.use(tools);

Vue.use(VueCookie);
Vue.config.productionTip = false;

import Vant from "vant";
import "vant/lib/index.css";
Vue.use(Vant);


// 挂载全局
Vue.prototype.$http = httpRequest; // ajax请求方法
Vue.prototype.isAuth = isAuth; // 权限方法
Vue.prototype.$md5 = md5; // md5加密

// 保存整站vuex本地储存初始状态
window.SITE_CONFIG["storeState"] = cloneDeep(store.state);

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  store,
  template: "<App/>",
  components: { App }
});

// import SocketIO from "socket.io-client";

// import VueSocketIO from "vue-socket.io";

// Vue.use(
//   new VueSocketIO({
//     debug: true,
//     connection: SocketIO("wss://broadcastlv.chat.bilibili.com/")
//   })
// );
