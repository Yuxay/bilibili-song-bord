import Mock from "mockjs";

Mock.mobile_prefix = ["132", "135", "136"];

Mock.numeric = "0123456789";

Mock.random = function(len, list) {
  if (len <= 1) {
    len = 1;
  }
  var s = "";
  var n = list.length;
  if (typeof list === "string") {
    while (len-- > 0) {
      s += list.charAt(Math.random() * n);
    }
  } else if (list instanceof Array) {
    while (len-- > 0) {
      s += list[Math.floor(Math.random() * n)];
    }
  }
  return s;
};

Mock.getMobile = function() {
  return Mock.random(1, Mock.mobile_prefix) + Mock.random(8, Mock.numeric);
};

// 生成数据列表
var dataList = [];
for (let i = 0; i < Math.floor(Math.random() * 10 + 1); i++) {
  dataList.push(
    Mock.mock({
      id: "@increment",
      createTime: "@time",
      siteTitle: "@ctitle",
      siteEnabled: 1,
      siteProvince: "@province",
      siteCity: "@city(false)",
      siteDistrict: "@county(false)",
      siteAddress: "@ctitle",
      siteLng: 116.307484,
      siteLat: 39.98412,
      siteTags: ["标签一", "标签二", "标签三"],
      // siteTags: "标签一 标签二 标签三",
      siteFeeDelay: 0,
      siteWorkTime: "",
      siteOperator: "",
      siteTel: Mock.getMobile(),
      siteFeeDeprecated: "@natural(3,7)",
      siteFeePolicy: "@natural(1,5)",
      siteReserveQuantity: "@integer(1,80)",
      siteImages: "https://img0.baidu.com/it/u=1428389279,1598272411&fm=26&fmt=auto&gp=0.jpg https://img0.baidu.com/it/u=1195456673,901319467&fm=26&fmt=auto&gp=0.jpg https://img0.baidu.com/it/u=2928658328,1246008724&fm=26&fmt=auto&gp=0.jpg"
    })
  );
}

// 获取用户列表
export function list() {
  return {
    // isOpen: false,
    url: "/charge/v1/site/list",
    type: "get",
    data: {
      msg: "success",
      code: 0,
      page: {
        totalCount: dataList.length,
        pageSize: 10,
        totalPage: 1,
        currPage: 1,
        list: dataList
      }
    }
  };
}

// 获取用户信息
export function info() {
  return {
    // isOpen: false,
    url: "/charge/v1/site/info",
    type: "get",
    data: {
      msg: "success",
      code: 0,
      site: dataList[0]
    }
  };
}

// 修改密码
export function updatePassword() {
  return {
    // isOpen: false,
    url: "/sys/user/password",
    type: "post",
    data: {
      msg: "success",
      code: 0
    }
  };
}

// 添加用户
export function add() {
  return {
    // isOpen: false,
    url: "/sys/user/save",
    type: "post",
    data: {
      msg: "success",
      code: 0
    }
  };
}

// 修改用户
export function update() {
  return {
    // isOpen: false,
    url: "/sys/user/update",
    type: "post",
    data: {
      msg: "success",
      code: 0
    }
  };
}

// 删除用户
export function del() {
  return {
    // isOpen: false,
    url: "/sys/user/delete",
    type: "post",
    data: {
      msg: "success",
      code: 0
    }
  };
}
