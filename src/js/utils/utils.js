import { baseUrl } from '../../config'

/**
 * @description 获取请求地址
 * @param {*} method 请求api
 * @param {*} root 请求api根目录
 */
export function GetApiUrl(method, root){
  return `${root||baseUrl}${method}`;
}

/**
 * @description POST请求
 * @param {*} url 请求地址，可以通过GetApiUrl拼接
 * @param {*} data 请求参数
 * @param {*} callback 请求成功后的回调
 */
export function Request(url, data, callback){
  $.ajax({
    type: 'POST',
    url: url,
    data: JSON.stringify(data),
    dataType: 'json',
    contentType: 'application/json;charset=utf-8',
    crossDomain: true,
    success: function(res) {
      if (res.code === 0) {
        callback && callback(res.data);
      }
    }
  })
}

/**
 * @description 设置图片自适应填充容器：将宽、高撑开到容器边缘，并设置图片居中显示
 * @param {*} img
 * @param {*} parentSelector 图片父容器，默认图片外层元素
 */
export function fullImg(img, parentSelector) {
  img = $(img);
  var src = img.attr("src");
  var parent = parentSelector ? img.parents(parentSelector) : img.parent();
  var parentWidth = parent.width();
  var parentHeight = parent.height();
  var nimg = new Image();
  nimg.onload = function () {
      var imgwidth = this.width;
      var imgheight = this.height;
      img.css({
          "top": 0,
          "left": 0
      });
      if (imgwidth / imgheight >= parentWidth / parentHeight) {
          img.height(parentHeight);
          var _width = imgwidth / imgheight * img.height();
          var _left = (_width - parentWidth) / 2;
          img.css({ "left": 0 - _left });
      } else {
          img.width(parentWidth);
          var _height = imgheight / imgwidth * img.width();
          var _top = (_height - parentHeight) / 2;
          img.css({ "top": 0 - _top });
      }
      img.fadeIn(350);
  }
  nimg.src = src;
}

/**
 * @description 设置图片自适应居中显示：设置图片最大宽、高为容器大小，并设置图片居中显示
 * @param {*} img
 * @param {*} parentSelector 图片父容器，默认图片外层元素
 */
export function fitImg (img, parentSelector) {
  img = $(img);

  var src = img.attr("src");
  var parent = parentSelector ? img.parents(parentSelector) : img.parent();
  var parentWidth = parent.width();
  var parentHeight = parent.height();

  var nimg = new Image();
  nimg.onload = function () {
      var imgwidth = this.width;
      var imgheight = this.height;

      img.css("margin-top", "0px");
      if (imgwidth / imgheight > parentWidth / parentHeight) {
          var rightHeight = parentWidth * imgheight / imgwidth;
          img.width(parentWidth);
          img.height(rightHeight);
          img.css("margin-top", (parentHeight - rightHeight) / 2 + "px");
      } else if (imgwidth / imgheight < parentWidth / parentHeight) {
          var rightWidth = parentHeight * imgwidth / imgheight;
          img.width(rightWidth);
          img.height(parentHeight);
      } else {
          img.width(parentWidth);
      }
      img.fadeIn(350);
  }
  nimg.src = src;
}
