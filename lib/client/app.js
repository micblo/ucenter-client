//
// UCenter Client Interface
// 
// Interface: App
//

module.exports = function(config) {
  const {
    ucApiPost
  } = require('../common')(config);
  const {
    unserializeXml
  } = require('../utils')(config);

  /**
   * 获取应用列表
   * @returns {Promise}
   * 应用列表数据，其中单条应用数组结构请参看附表
   */
  function getAppList() {
    return new Promise(function(resolve, reject) {
      ucApiPost('app', 'ls', {})
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
    getAppList
  };
};