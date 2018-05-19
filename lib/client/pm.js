//
// UCenter Client Interface
// 
// Interface: PM
//

module.exports = function(config) {
  const {
    ucApiPost,
    ucApiUrl
  } = require('../common')(config);
  const {
    unserializeXml,
    urlEncode
  } = require('../utils')(config);

  /**
   * 进入短消息中心
   * @param {number} uid 用户 ID
   * @param {boolean} newpm 是否直接查看未读短消息
   * @returns {string} 短消息中心 URL
   */
  function getPMCenterUrl(uid, newpm) {
    return ucApiUrl('pm_client', 'ls', `uid=${uid}`, ($newpm ? '&folder=newbox' : ''));
  }

  /**
   * 检查新的短消息
   * @param {number} uid 用户 ID
   * @param {number} more 是否显示更多信息
   * @returns {Promise}
   * 返回值 (当 more = 0 时): { newpm: 未读消息数 }
   * 返回值 (当 more = 1 时): { newpm: 未读消息数, newprivatepm: 私人消息数 } ；
   * 返回值 (当 more = 2 时): { newpm: 未读消息数, newprivatepm: 私人消息数, newchatpm: 群聊消息数 } ；
   * 返回值 (当 more = 3 时):
   * integer ['newpm']	未读消息数; 
   * integer ['newprivatepm']	私人消息数; 
   * integer ['newchatpm']	群聊消息数; 
   * integer ['lastdate']	最后消息时间; 
   * integer ['lastmsgfromid']	最后消息发件人 ID; 
   * string  ['lastmsgfrom']	最后消息发件人用户名; 
   * string  ['lastmsg']	最后消息内容
   */
  function checkNew(uid, more) {
    more = parseInt(more);
    switch (more) {
      case 1:
      case 2:
      case 3:
        break;
      default:
        more = 0;
    }

    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'check_newpm', {
          uid,
          more
        })
        .then(function(data) {
          if (more === 0) {
            return resolve({
              newpm: parseInt(data) || data
            });
          }

          data = unserializeXml(data);
          if (!data) return reject('返回数据不完整');

          resolve(data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 发送短消息
   * @param {number} fromuid 发件人用户 ID
   * @param {string} msgto 收件人用户名 / 用户 ID，多个用逗号分割
   * @param {string} subject 消息标题
   * @param {string} message 消息内容
   * @param {bool} instantly 是否直接发送 (默认为 true)
   * @param {number} replypmid 回复的消息 ID
   * @param {boolean} isusername msgto 参数是否为用户名（false 时msgto为用户 ID）
   * @param {number} type 消息类别：0 私人消息(默认), 1 群聊消息
   * @returns {Promise|string}
   * 直接发送发送时，返回状态码。 
   * 大于 0:发送成功的最后一条消息 ID
   * 0:发送失败; -1:超过两人会话的最大上限
   * -2:超过两次发送短消息时间间隔; -3:不能给非好友批量发送短消息(已废弃)
   * -4:目前还不能使用发送短消息功能（注册多少日后才可以使用发短消息限制）
   * -5:超过群聊会话的最大上限
   * -6:在忽略列表中; -7:超过群聊人数上限
   * -8:不能给自己发短消息; -9:收件人为空
   * -10:发起群聊人数小于两人
   * 不直接发送时，返回发送短消息的界面的URL
   */
  function send(fromuid, msgto, subject, message, instantly, replypmid, isusername, type) {
    replypmid = parseInt(replypmid) || 0;
    isusername = parseInt(isusername) || 0;
    type = parseInt(type) || 0;

    if (instantly === true) {
      return new Promise(function(resolve, reject) {
        ucApiPost('pm', 'sendpm', {
            fromuid,
            msgto,
            subject,
            message,
            replypmid,
            isusername,
            type
          })
          .then(function(data) {
            resolve(parseInt(data) || data);
          })
          .catch(function(err) {
            reject(err);
          });
      });
    } else {
      fromuid = parseInt(fromuid);
      subject = urlEncode(subject);
      msgto = urlEncode(msgto);
      message = urlEncode(message);
      replypmid = parseInt(fromuid) || 0;
      const replyadd = replypmid ? `&pmid=${replypmid}&do=reply` : '';
      return ucApiUrl('pm_client', 'send', `uid=${fromuid}`,
        `&msgto=${msgto}&subject=${subject}&message=${message}${replyadd}`);
    }
  }

  /**
   * 删除短消息
   * @param {number} uid 用户 ID
   * @param {Array} pmids 消息 ID 数组
   * @returns {Promise}
   * 是否成功 
   */
  function deletePM(uid, pmids) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'delete', {
          uid,
          pmids
        })
        .then(function(data) {
          resolve(!!data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 删除与某一用户的所有短消息
   * @param {number} uid 用户 ID
   * @param {Array} touids 对方用户 ID 数组
   * @returns {Promise}
   * 是否成功 
   */
  function deleteUserPM(uid, touids) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'deleteuser', {
          uid,
          touids
        })
        .then(function(data) {
          resolve(!!data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 删除和退出群聊
   * @param {number} uid 用户 ID
   * @param {Array} plids 要删除的消息会话 ID 数组
   * @param {number} type	类别 - 0:(默认值) 退出群聊; 1:删除群聊
   * @returns {Promise}
   * 是否成功 
   */
  function deleteChat(uid, plids, type) {
    type = type || 0;

    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'deletechat', {
          uid,
          plids,
          type
        })
        .then(function(data) {
          resolve(!!data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 标记短消息已读/未读状态
   * @param {number} uid 用户 ID
   * @param {Array} uids 要标记的对方用户 ID 数组
   * @param {Array} pmids 要标记的会话 ID 数组，默认值空数组
   * @param {number} status 要标记的状态 - 0:(默认值) 标记为已读; 1:标记为未读
   * @returns {Promise}
   * 是否成功 
   */
  function setReadStatus(uid, uids, pmids, status) {
    pmids = pmids || [];
    status = status || 0;

    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'readstatus', {
          uid,
          uids,
          pmids,
          status
        })
        .then(function(data) {
          resolve(!!data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 获取短消息列表
   * @param {number} uid 用户 ID
   * @param {Array} page 当前页编号，默认值 1
   * @param {Array} pagesize 每页最大条目数，默认值 10
   * @param {number} folder 短消息所在的文件夹 - newbox:新件箱; inbox:(默认值) 收件箱; outbox:发件箱
   * @param {number} msglen 截取短消息内容文字的长度，0 为不截取，默认值 0
   * @returns {Promise}
   * {count, data: { 消息列表单条数组结构 }}
   */
  function getList(uid, page, pagesize, folder, msglen) {
    page = page < 1 ? 1 : page;
    pagesize = pagesize < 1 ? 10 : pagesize;
    folder = folder || 'inbox';
    const filter = 'newpm';
    msglen = msglen || 0;

    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'ls', {
          uid,
          page,
          pagesize,
          folder,
          filter,
          msglen
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

  /**
   * 忽略未读消息提示
   * @param {number} uid 用户 ID
   */
  function ignoreUnread(uid) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'ignore', {
          uid
        })
        .then(function(data) {
          resolve();
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 获取短消息内容
   * @param {number} uid 用户 ID
   * @param {number} pmid 消息 ID
   * @param {number} touid 消息对方用户 ID
   * @param {number} daterange 日期范围 - 1:(默认值) 今天; 2:昨天; 3:前天; 4:上周; 5:更早
   * @param {number} page 当前页码
   * @param {number} pagesize 每页最大条数
   * @param {number} type 消息类型 - 1: 私人消息, 2: 群聊消息
   * @param {boolean} isplid touid参数是会话id还是用户id
   * @returns {Promise}
   * 返回消息单条数组结构
   */
  function view(uid, pmid, touid, daterange, page, pagesize, type, isplid) {
    daterange = daterange || 1;
    page = page || 1;
    pagesize = pagesize < 1 ? 10 : pagesize;
    pmid = pmid || 0;
    type = type || 0;
    isplid = isplid ? 1 : 0;

    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'view', {
          uid,
          pmid,
          touid,
          daterange,
          page,
          pagesize,
          type,
          isplid
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

  /**
   * 查找会话消息数量
   * @param {number} uid 用户 ID
   * @param {number} touid 查找的会话 ID 或者用户 ID
   * @param {boolean} isplid touid参数是会话 ID 还是用户 ID
   */
  function getViewNumber(uid, touid, isplid) {
    isplid = isplid ? 1 : 0;

    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'viewnum', {
          uid,
          touid,
          isplid
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
   * 获取单条短消息内容
   * @param {number} uid 用户 ID
   * @param {number} pmid 消息 ID
   * @returns {Promise}
   * 短消息内容数据
   */
  function viewNode(uid, pmid) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'viewnode', {
          uid,
          pmid,
          type: 0
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

  /**
   * 查找群聊成员列表
   * @param {number} uid 用户 ID
   * @param {number} plid 群聊会话 ID
   * @returns {Promise}
   * 返回群聊的成员列表
   */
  function getChatPMMemberList(uid, plid) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'chatpmmemberlist', {
          uid,
          plid
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

  /**
   * 踢出群聊成员
   * @param {number} plid 会话 ID
   * @param {number} uid 用户 ID
   * @param {number} touid 踢出的用户 ID
   * @returns {Promise}
   * 返回是否成功
   */
  function kickChatPM(plid, uid, touid) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'kickchatpm', {
          plid,
          uid,
          touid
        })
        .then(function(data) {
          switch (data) {
            case '1':
              resolve(true);
              break;

            case '2':
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
   * 添加群聊成员
   * @param {number} plid 会话 ID
   * @param {number} uid 用户 ID
   * @param {number} touid 踢出的用户 ID
   * @returns {Promise}
   * 返回是否成功
   */
  function appendChatPM(plid, uid, touid) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'appendchatpm', {
          plid,
          uid,
          touid
        })
        .then(function(data) {
          switch (data) {
            case '1':
              resolve(true);
              break;

            case '2':
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
   * 获取黑名单
   * @param {number} uid 用户 ID
   * @returns {Promise}
   * 返回	黑名单内容数据
   */
  function getBlackList(uid) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'blackls_get', {
          uid
        })
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 更新黑名单
   * 本接口函数用于更新用户的黑名单列表数据。
   * 设置黑名单后，黑名单中的人员将无法发送短消息给 uid 指定的用户。
   * 黑名单中被忽略的人员用用户名表示，多个忽略人员名单时用逗号 "," 隔开(如:张三,李四,王五)，如需禁止所有用户发来的短消息，请用 "{ALL}" 表示。
   * @param {number} uid 用户 ID
   * @param {string} blackls 黑名单内容
   * @returns {Promise}
   * 返回是否成功
   */
  function setBlackList(uid, blackls) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'blackls_set', {
          uid,
          blackls
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
   * 添加用户到黑名单
   * 本接口函数用于添加用户的黑名单项目。
   * 如需添加屏蔽所有用户的设置，请让 username 数组中包含 "{ALL}"
   * @param {number} uid 用户 ID
   * @param {Array} username 用户名数组
   * @returns {Promise}
   * 返回	是否成功
   */
  function addToBlackList(uid, username) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'blackls_add', {
          uid, username
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
   * 删除黑名单项目
   * 本接口函数用于删除用户的黑名单项目。
   * 如需删除屏蔽所有用户的设置，请让 username 数组中包含 "{ALL}"
   * @param {number} uid 用户 ID
   * @param {Array} username 用户名数组
   */
  function deleteFromBlackList(uid, username) {
    return new Promise(function(resolve, reject) {
      ucApiPost('pm', 'blackls_delete', {
          uid, username
        })
        .then(function(data) {
          resolve();
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  return {
    getPMCenterUrl,
    checkNew,
    send,
    deletePM,
    deleteUserPM,
    deleteChat,
    setReadStatus,
    getList,
    ignoreUnread,
    view,
    viewNode,
    getViewNumber,
    getChatPMMemberList,
    kickChatPM,
    appendChatPM,
    getBlackList,
    setBlackList,
    addToBlackList,
    deleteFromBlackList
  };

};