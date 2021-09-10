export default {
  install: (Vue, options) => {
    /**
     * 计算占比并返回保留两位的小数
     * @param {*} num
     * @param {*} total
     * @returns
     */
    Vue.prototype.toPercent = function(num, total) {
      return Math.round((num / total) * 10000) / 100.0 + "%"; // 小数点后两位百分比
    };

    /**
     * 路由跳转
     * @param {*} val 跳转路径
     */
    Vue.prototype.basePushFun = function(val = "/") {
      this.$router.push({
        path: val
      });
    };

    /**
     * 时间格式化方法
     * @param {*} unixtime 时间戳
     * @returns 格式化后的时间
     */
    Vue.prototype.timeFun = function(unixtime) {
      if (!unixtime) {
        return "/";
      }
      var dateTime = new Date(parseInt(unixtime));
      var year = dateTime.getFullYear();
      var month = dateTime.getMonth() + 1;
      var day = dateTime.getDate();
      var hour = dateTime.getHours();
      var minute = dateTime.getMinutes();
      var second = dateTime.getSeconds();
      unixtime =
        year +
        "-" +
        (month < 10 ? "0" + month : month) +
        "-" +
        (day < 10 ? "0" + day : day) +
        " " +
        (hour < 10 ? "0" + hour : hour) +
        ":" +
        (minute < 10 ? "0" + minute : minute);
      return unixtime;
    };

    /**
     * 元与分的相互转化
     * @param {*} price 价格数字
     * @param {*} change 要转换成单位
     * @returns 转换后的价格数字
     */
    Vue.prototype.moneyFun = function(price, change) {
      let num = !this.isEmpty(price) ? parseFloat(price) : 0;
      if (change == "y2f") {
        return this.NumberMul(num, 100);
      } else if (change == "f2y") {
        return this.accDiv(num, 100);
      }
    };
    /**
     * 乘法
     * @param {number} arg1 第一个数
     * @param {number} arg2 第二个数
     * @returns 计算结果
     */
    Vue.prototype.NumberMul = function(arg1, arg2) {
      var m = 0;
      var s1 = arg1.toString();
      var s2 = arg2.toString();
      try {
        m += s1.split(".")[1].length;
      } catch (e) {}
      try {
        m += s2.split(".")[1].length;
      } catch (e) {}

      return (
        (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) /
        Math.pow(10, m)
      );
    };
    /**
     * 除法
     * @param {number} arg1 第一个数
     * @param {number} arg2 第二个数
     * @returns 计算结果
     */
    Vue.prototype.accDiv = function(arg1, arg2) {
      var m = 0;
      var s1 = arg1.toString();
      var s2 = arg2.toString();
      try {
        m += s1.split(".")[1].length;
      } catch (e) {}
      try {
        m += s2.split(".")[1].length;
      } catch (e) {}

      return (
        Number(s1.replace(".", "")) /
        Number(s2.replace(".", "")) /
        Math.pow(10, m)
      );
    };
    /**
     * JSON数组去重
     * @param {array} array json Array
     * @param {string} key 唯一的key名，根据此键名进行去重
     * @param {boolean} returnRepat false:返回去重后的数组 true:返回重复的数据
     * @returns 返回去重后的数组
     */
    Vue.prototype.uniqueArray = function(array, key, returnRepat = false) {
      var result = [array[0]];
      for (var i = 1; i < array.length; i++) {
        var item = array[i];
        var repeat = false;
        for (var j = 0; j < result.length; j++) {
          if (item[key] == result[j][key]) {
            repeat = true;
            break;
          }
        }
        if (!repeat) {
          result.push(item);
        }
      }
      return result;
    };
    /**
     * 普通数组去重
     */
    Vue.prototype.unique = function(arr) {
      for (var i = 0; i < arr.length; i++) {
        for (var j = i + 1; j < arr.length; j++) {
          if (arr[i] == arr[j]) {
            //第一个等同于第二个，splice方法删除第二个
            arr.splice(j, 1);
            j--;
          }
        }
      }
      return arr;
    };
    /**
     * 获取随机数的方法
     * @param {*} min 最小数
     * @param {*} max 最大数
     * @returns 随机数
     */
    Vue.prototype.getRandomNumber = function(min, max) {
      for (let i = 0; i < 10; i++) {
        let x = Math.floor(Math.random() * (max - min + 1)) + min;
        return x;
      }
    };
    /**
     * 判断数据是否为空
     * @param {*} str
     * @returns
     */
    Vue.prototype.isBlank = function(str) {
      let strValue = str + "";
      let objectStr = Object.prototype.toString.call(strValue);
      let isUndefined = true;
      // logs(objectStr)
      if (objectStr === "[object Undefined]") {
        //空
        isUndefined = true;
      } else if (
        objectStr === "[object String]" ||
        objectStr === "[object Array]"
      ) {
        //字条串或数组
        isUndefined =
          strValue.length == 0 ||
          strValue + "" == "undefined" ||
          strValue + "" == "null"
            ? true
            : false;
      } else if (objectStr === "[object Object]") {
        isUndefined = JSON.stringify(strValue) == "{}" ? true : false;
      } else {
        isUndefined = true;
      }
      // logs("isUndefined", isUndefined)
      return isUndefined;
    };
    /**
     * 判断数据是否为空(空对象、空字符串、空数组等)
     * @param val
     */
    Vue.prototype.isEmpty = function(val) {
      let valType = Object.prototype.toString.call(val);
      let isEmpty = false;
      if (valType === "[object Undefined]" || valType == "[object Null]") {
        isEmpty = true;
      } else if (
        valType === "[object Array]" ||
        valType === "[object String]"
      ) {
        isEmpty =
          val.length <= 0 || val + "" === "undefined" || val + "" === "null"
            ? true
            : false;
      } else if (valType == "[object Object]") {
        let temp = JSON.stringify(val);
        if (temp == "{}") {
          isEmpty = true;
        } else {
          isEmpty = false;
        }
      }
      return isEmpty;
    };
    Vue.prototype.changeDate = function(date) {
      var myDate = new Date(date);
      var day = myDate.getDate();
      if (day < 10) {
        day = `0${day}`;
      }
      var mon = myDate.getMonth() + 1;
      if (mon < 10) {
        mon = `0${mon}`;
      }
      var year = myDate.getFullYear();
      var val = `${year}-${mon}-${day}`;
      return val;
    };
    /**
     * 检查对象中的数据是否有变化
     * @param {object} oldObj 旧对象
     * @param {object} newObj 新对象
     * @returns {object} 筛选出来的对象
     */
    Vue.prototype.matchObj = function(oldObj, newObj) {
      let res = {};
      // debugger
      var keyArr = Object.keys(oldObj);
      for (let index = 0; index < keyArr.length; index++) {
        const element = keyArr[index];
        if (oldObj[element] !== newObj[element]) {
          res[element] = newObj[element];
        }
      }
      return res;
    };
    /**
     * 短横线 ( - ) 转 小驼峰
     * @param {string} str 字符串
     * @returns {string} 转换后的字符串
     */
    Vue.prototype.toCamelCaseVar = function(str) {
      let reg = /-+(\w)/g;
      let res = str.replace(reg, function() {
        if (arguments[2]) return arguments[1].toUpperCase();
        else return arguments[0];
      });
      return res;
    };
    /**
     * 截取指定位数字符串并添加省略号
     * @param {string} dot 原字符串
     * @param {number} len 要截取的长度
     * @returns 
     */
    Vue.prototype.cutString = function(dot, len) {
      var dotStr = "";
      if (dot) {
        dotStr = dot.replace(/<[^>]+>/g, "");
        dotStr = dotStr.replace(/&nbsp;/g, "");
        dotStr = dotStr.replace(/&ldquo;/g, "");
        if (dotStr.length > len) {
          dotStr = dotStr.substring(0, len);
          dotStr = dotStr + "...";
        }
      }
      return dotStr;
    };
  }
};
