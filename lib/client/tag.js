//
// UCenter Client Interface
// 
// Interface: Tag
//

module.exports = function(config) {
  const {
    ucApiPost
  } = require('../common')(config);
  const {
    unserializeXml
  } = require('../utils')(config);

  /**
   * 获取标签数据
   * @param {string} tagname 标签名称
   * @param {Array} nums 指定每个应用返回多少条数据，数组格式如下：
   * [{应用 ID:	返回数据条数}]
   * @returns {Promise}
   * 标签数据，其中单条标签数组结构请参看附表
   */
  function getTags(tagname, nums) {
    return new Promise(function(resolve, reject) {
      ucApiPost('tag', 'gettag', {
          tagname,
          nums
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
    getTags
  };
};