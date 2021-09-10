/**
 * 全站路由配置
 *
 * 建议:
 * 1. 代码中路由统一使用name属性跳转(不使用path属性)
 */
import Vue from "vue";
import Router from "vue-router";
import http from "@/utils/httpRequest";
import { isURL } from "@/utils/validate";
import { clearLoginInfo } from "@/utils";

Vue.use(Router);

// 开发环境不使用懒加载, 因为懒加载页面太多的话会造成webpack热更新太慢, 所以只有生产环境使用懒加载
const _import = require("./import-" + process.env.NODE_ENV);

// 全局路由(无需嵌套上左右整体布局)
const globalRoutes = [
  {
    path: "/",
    component: _import("modules/bilibili/new"),
    // component: _import("modules/bilibili/test"),
    name: "home",
    meta: { title: "首页" },
  },
];

const router = new Router({
  mode: "hash",
  scrollBehavior: () => ({ y: 0 }),
  isAddDynamicMenuRoutes: false, // 是否已经添加动态(菜单)路由
  routes: globalRoutes
});

export default router