import axios from 'axios';

// axios.defaults.baseURL = process.env.BASE_API;
// axios.defaults.baseURL = 'http://192.168.3.39:8082/';

const service = axios.create({
  timeout: 600000,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json; charset=UTF-8'
  },
})
service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data;
    return res
  },
  error => {
  }
)
service.adornUrl = actionName => {
  // 非生产环境 && 开启代理, 接口前缀统一使用[/proxyApi/]前缀做代理拦截!
  return (
    (process.env.NODE_ENV !== "production" && process.env.OPEN_PROXY
      ? "/proxyApi/"
      : window.SITE_CONFIG.baseUrl) + actionName
  );
};
export default service
