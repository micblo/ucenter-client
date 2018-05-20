//
// UCenter Client Interface
// 
// Interface: Feed
//

module.exports = function(config) {
  const {
    ucApiPost
  } = require('../common')(config);
  const {
    unserializeXml
  } = require('../utils')(config);

  /**
   * 添加事件
   * 本接口函数用于向 UCenter Home 添加事件。如果正确则返回事件的 ID。
   * @param {string} icon 图标类型，如：thread、post、video、goods、reward、debate、blog、album、comment、wall、friend
   * @param {number} uid 用户 ID
   * @param {string} username 用户名
   * @param {string} title_template 标题模板
   * @param {Object} title_data 标题数据对象
   * @param {string} body_template 内容模板
   * @param {Object} body_data 模板数据对象
   * @param {string} body_general 【保留】相同事件合并时用到的数据：特定的数组，只有两项：name、link
   * @param {string} target_ids 【保留】
   * @param {Array} images 相关图片的 URL 和链接地址，格式: [{imageUrl, link}]
   * @returns {Promise}
   * 返回事件的 ID
   */
  function add(icon, uid, username, title_template, title_data, body_template, body_data, body_general, target_ids, images) {
    title_template = title_template || '';
    title_data = title_data || '';
    body_template = body_template || '';
    body_data = body_data || '';
    body_general = body_general || '';
    target_ids = target_ids || '';
    images = images || [];
    for (let i = 0; i < 4; i++) {
      images[i] = images[i] || [];
    }
    return new Promise(function(resolve, reject) {
      ucApiPost('feed', 'add', {
          icon,
          uid,
          username,
          title_template,
          title_data,
          body_template,
          body_data,
          body_general,
          target_ids,
          image_1: images[0].url || '',
          image_1_link: images[0].link || '',
          image_2: images[1].url || '',
          image_2_link: images[1].link || '',
          image_3: images[2].url || '',
          image_3_link: images[2].link || '',
          image_4: images[3].url || '',
          image_4_link: images[3].link || ''
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
   * 获取全站事件列表
   * 本接口函数用于提取事件。如果正确则返回事件列表数组。
   * @param {number} limit 取事件的条数，默认为 100 条
   * @returns {Promise}
   * 事件列表数据，数组结构请参看附表
   */
  function getList(limit) {
    limit = limit || 100;

    return new Promise(function(resolve, reject) {
      ucApiPost('feed', 'get', {
          limit,
          delete: 'TRUE'
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
    getList
  };
};