//
// UCenter Client Interface
// 
// Interface: Avatar
//

module.exports = function(config) {
  const {
    ucApiPost,
    request
  } = require('../common')(config);

  // TODO: Upload images for Avatar

  /**
   * 获取头像图片链接
   * @param {number} uid 用户 ID
   * @param {string} size 头像大小。
   * big:大头像（200 x 250）;
   * middle:(默认值) 中头像（120 x 120），默认值为此;
   * small:小头像（48 x 48）
   * @param {string} type 头像类型
   * real:真实头像
   * virtual:(默认值) 虚拟头像，默认值为此
   * @returns {string}
   */
  function getAvatarUrl(uid, size, type) {
    size = size || 'middle';
    type = type || 'virtual';

    return config.UC_API +
      `/avatar.php?uid=${uid}&size=${size}&type=${type}`;
  }

  /**
   * 检测头像是否存在
   * @param {number} uid 用户 ID
   * @param {string} size 头像大小。
   * big:大头像（200 x 250）;
   * middle:(默认值) 中头像（120 x 120），默认值为此;
   * small:小头像（48 x 48）
   * @param {string} type 头像类型
   * real:真实头像
   * virtual:(默认值) 虚拟头像，默认值为此
   * @returns {Promise}
   * 返回 头像是否存在
   */
  function checkAvatar(uid, size, type) {
    size = size || 'middle';
    type = type || 'virtual';

    const url = config.UC_API +
      `/avatar.php?uid=${uid}&size=${size}&type=${type}&check_file_exists=1`;

    return new Promise(function(resolve, reject) {
      request.get(url, function(err, req, body) {
        if (err) {
          return reject('连接用户服务器失败');
        }

        switch (body) {
          case '1':
            resolve(true);
            break;

          case '0':
            resolve(false);
            break;

          default:
            reject(err);
        }
      });
    });
  }

  return {
    getAvatarUrl,
    checkAvatar
  };
};