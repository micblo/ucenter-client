//
// UCenter Client Interface
// 
// Interface: Credit
//

module.exports = function(config) {
  const {
    ucApiPost
  } = require('../common')(config);

  /**
   * 积分兑换请求
   * @param {number} uid 用户 ID
   * @param {number} from 原积分值
   * @param {number} to 目标积分值
   * @param {number} toappid 目标应用ID
   * @param {number} amount 积分数额
   * @returns {Promise}
   * 返回 是否成功
   */
  function requestExchange(uid, from, to, toappid, amount) {
    return new Promise(function(resolve, reject) {
      ucApiPost('credit', 'request', {
          uid,
          from,
          to,
          toappid,
          amount
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

  return {
    requestExchange
  }
};