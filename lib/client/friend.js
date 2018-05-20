//
// UCenter Client Interface
// 
// Interface: Friend
//

module.exports = function(config) {
  const {
    ucApiPost
  } = require('../common')(config);
  const {
    unserializeXml,
    urlEncode
  } = require('../utils')(config);

  /**
   * 添加好友
   * @param {number} uid 用户 ID
   * @param {number} friendid 好友用户 ID
   * @param {string} comment 备注，可为空
   * @returns {Promise}
   * 返回 是否成功
   */
  function add(uid, friendid, comment) {
    comment = comment || '';

    return new Promise(function(resolve, reject) {
      ucApiPost('friend', 'add', {
          uid,
          friendid,
          comment
        })
        .then(function(data) {
          switch (data) {
            case '1':
              resolve(true);
              break;

            case '0':
              resolve(false);
              break;

            default:
              reject(err);
          }
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 删除好友
   * @param {number} uid 用户 ID
   * @param {Array} friendids 好友用户 ID 数组。数组的每一个值均代为好友用户 ID。
   * @returns {Promise}
   * 返回 被删除的好友数
   */
  function deleteFriend(uid, friendids) {
    return new Promise(function(resolve, reject) {
      ucApiPost('friend', 'delete', {
          uid,
          friendids
        })
        .then(function(data) {
          resolve(parseInt(data) || data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 获取好友总数
   * @param {number} uid 用户 ID
   * @param {number} direction 0:(默认值) 指定用户的全部好友;
   * 1:正向，指定用户添加的好友，但没被对方添加;
   * 2:反向，指定用户被哪些用户添加为好友，但没被对方添加;
   * 3:双向，互相添加为好友
   * @returns {Promise}
   * 返回 好友数目
   */
  function getTotalNumber(uid, direction) {
    return new Promise(function(resolve, reject) {
      ucApiPost('friend', 'totalnum', {
          uid,
          direction
        })
        .then(function(data) {
          resolve(parseInt(data) || data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 获取好友列表
   * @param {number} uid 用户 ID
   * @param {number} page 当前页编号，默认值 1
   * @param {number} pagesize 每页最大条目数，默认值 10
   * @param {number} totalnum 好友总数，默认值 10
   * @param {number} direction 0:(默认值) 指定用户的全部好友;
   * 1:正向，指定用户添加的好友，但没被对方添加;
   * 2:反向，指定用户被哪些用户添加为好友，但没被对方添加;
   * 3:双向，互相添加为好友
   * @returns {Promise}
   * 返回好友列表数据，其中单条好友数组结构请参看附表
   */
  function getList(uid, page, pagesize, totalnum, direction) {
    page = page < 1 ? 1 : page;
    pagesize = pagesize < 1 ? 10 : pagesize;
    totalnum = totalnum || 10;
    direction = direction || 0;

    return new Promise(function(resolve, reject) {
      ucApiPost('friend', 'ls', {
          uid,
          page,
          pagesize,
          totalnum,
          direction
        })
        .then(function(data) {
          data = unserializeXml(data);
          if (!data) return reject('返回数据不完整');
          resolve(data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  return {
    add,
    deleteFriend,
    getTotalNumber,
    getList
  };
};