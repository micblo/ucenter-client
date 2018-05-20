//
// UCenter Client Interface
// 
// Interface: Mail
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
   * 添加邮件到队列
   * @param {Array|string} uids 用户 ID 数组。字符串时用半角逗号隔开
   * @param {Array|string} emails 目标 Email 数组。字符串时用半角逗号隔开
   * @param {string} subject 邮件标题
   * @param {string} message 邮件内容
   * @param {string} frommail 发信人，可选参数，默认为空，uc后台设置的邮件来源作为发信人地址
   * @param {string} charset 邮件字符集，可选参数，默认为gbk
   * @param {boolean} htmlon 是否是html格式的邮件，可选参数，默认为FALSE，即文本邮件
   * @param {number} level 	邮件级别，可选参数，默认为1。
   * 数字大的优先发送，取值为0的时候立即发送，邮件不入队列
   * @returns {Promise}
   * false: 失败 - 进入队列失败，或者发送失败
   * integer: 成功 - 进入队列的邮件的id，当level为0，则返回1
   */
  function queue(uids, emails, subject, message, frommail, charset, htmlon, level) {
    if (Array.isArray(uids)) uids = uids.join(',');
    if (Array.isArray(emails)) emails = emails.join(',');
    frommail = frommail || '';
    charset = charset || 'gbk';
    htmlon = htmlon ? 'TRUE' : 'FALSE';
    level = level ? level : 1;

    return new Promise(function(resolve, reject) {
      ucApiPost('mail', 'add', {
          uids,
          emails,
          subject,
          message,
          frommail,
          charset,
          htmlon,
          level
        })
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  return {
    queue
  };
};