//
// UCenter Client Interface
// 
// Interface: User
//

module.exports = function(config) {
  const {
    ucApiPost
  } = require('../common')(config);
  const {
    unserializeXml
  } = require('../utils')(config);

  /**
   * 用户注册
   * @param {string} username 用户名
   * @param {string} password 密码
   * @param {string} email 电子邮箱
   * @param {number} questionid 安全提问索引
   * @param {string} answer 安全提问答案
   * @param {string} regip 注册IP
   * @returns {Promise}
   * 大于 0:返回用户 ID，表示用户注册成功
   * -1:用户名不合法; -2:包含不允许注册的词语
   * -3:用户名已经存在; -4:Email 格式有误
   * -5:Email 不允许注册; -6:该 Email 已经被注册
   */
  function register(username, password, email, questionid, answer, regip) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'register', {
          username,
          password,
          email,
          questionid: questionid || '',
          answer: answer || '',
          regip: regip || '',
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
   * 用户登录
   * @param {string} username 用户名 / 用户 ID / 用户 E-mail
   * @param {string} password 密码
   * @param {number} isuid 登录方式 0:(默认值) 用户名; 1:用户 ID; 用户 E-mail              
   * @param {boolean} checkques 是否验证安装提问
   * @param {numer} questionid 安全提问索引
   * @param {string} answer 安全提问答案
   * @returns {Promise} 
   * integer [0]
   *    大于 0:返回用户 ID，表示用户登录成功
   *    -1:用户不存在，或者被删除; -2:密码错; -3:安全提问错
   * string [1]	用户名
   * string [2]	密码
   * string [3]	Email
   * bool   [4]	用户名是否重名
   */
  function login(username, password, isuid, checkques, questionid, answer) {
    isuid = isuid || 0;
    checkques = checkques ? 1 : 0;

    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'login', {
          username,
          password,
          isuid,
          checkques,
          questionid: questionid || '',
          answer: answer || ''
        })
        .then(function(data) {
          data = unserializeXml(data);
          if (!data) return reject('返回数据不完整');

          resolve({
            uid: parseInt(data[0]),
            username: data[1],
            password: data[2],
            email: data[3],
            isRepeated: !!parseInt(data[4])
          });
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 更新用户资料
   * @param {string} username 用户名
   * @param {boolean} isuid 是否使用用户 ID获取 否则使用用户名获取
   * @returns {Promise} [	用户 ID, 用户名, Email ]
   */
  function getInfo(username, isuid) {
    isuid = isuid ? 1 : 0;

    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'get_user', {
          username,
          isuid
        })
        .then(function(data) {
          if (data === '0') return reject('用户不存在');

          data = unserializeXml(data);
          if (!data) return reject('返回数据不完整');

          resolve({
            uid: parseInt(data[0]),
            username: data[1],
            email: data[2]
          });
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 更新用户资料
   * @param {string} username 用户名
   * @param {string} oldpw 旧密码
   * @param {string} newpw 新密码，如不修改为空
   * @param {string} email Email，如不修改为空
   * @param {boolean} ignoreoldpw 是否忽略旧密码. (默认值) 不忽略，更改资料需要验证密码
   * @param {number} questionid 安全提问索引
   * @param {string} answer 安全提问答案
   * @returns {Promise}
   * 1:更新成功; 0:没有做任何修改
   * -1:旧密码不正确; -4:Email 格式有误
   * -5:Email 不允许注册; -6:该 Email 已经被注册
   * -7:没有做任何修改; -8:该用户受保护无权限更改
   */
  function editUser(username, oldpw, newpw, email, ignoreoldpw, questionid, answer) {
    ignoreoldpw = ignoreoldpw ? 1 : 0;

    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'edit', {
          username,
          oldpw,
          newpw,
          email,
          ignoreoldpw,
          questionid: questionid || '',
          answer: answer || ''
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
   * 删除用户
   * @param {number} uid 用户 ID
   * @param {boolean}
   */
  function deleteUser(uid) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'delete', {
          uid
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
   * 删除用户头像
   * @param {number} uid 
   */
  function deleteAvatar(uid) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'deleteavatar', {
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
   * 同步登录
   * @param {number} uid 
   * @returns {Promise}
   * 同步登录的 HTML 代码
   * Note: 如果当前应用程序在 UCenter 中设置允许同步登录，那么本接口函数会通知其他设置了同步登录的应用程序登录，把返回的 HTML 输出在页面中即可完成对其它应用程序的通知。输出的 HTML 中包含执行远程的 javascript 脚本，请让页面在此脚本运行完毕后再进行跳转操作，否则可能会导致无法同步登录成功。同时要保证同步登录的正确有效，请保证其他应用程序的 Cookie 域和 Cookie 路径设置正确。
   */
  function syncLogIn(uid) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'synlogin', {
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
   * 同步退出 
   * @returns {Promise}
   * 同步退出的 HTML 代码
   */
  function syncLogOut() {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'synlogout', {})
        .then(function(data) {
          resolve(data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  /**
   * 检查 Email 地址
   * @param {string} email 
   * @returns {Promise}
   * 1:成功; -4:Email 格式有误
   * -5:Email 不允许注册; -6:该 Email 已经被注册
   */
  function checkEmail(email) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'check_email', {
          email
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
   * 检查用户名
   * @param {string} username
   * @returns {Promise}
   * 1:成功; -1:用户名不合法;
   * -2:包含不允许注册的词语; -3:用户名已经存在
   */
  function checkName(username) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'check_username', {
          username
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
   * 添加保护用户
   * @param {string} username 受保护用户名
   * @param {string} admin 操作的管理员名
   * @returns {Promise}
   * 是否成功添加保护 (false 当且仅当数据库故障时发生)
   */
  function addProtectedUser(username, admin) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'addprotected', {
          username,
          admin: admin || ''
        })
        .then(function(data) {
          switch (data) {
            case '1':
              resolve(true);
              break;

            case '-1':
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
   * 删除保护用户
   * @param {string} username 受保护用户名
   * @returns {Promise}
   * 是否成功删除保护 (false 当且仅当数据库故障时发生)
   */
  function deleteProtectedUser(username) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'deleteprotected', {
          username
        })
        .then(function(data) {
          switch (data) {
            case '1':
              resolve(true);
              break;

            case '-1':
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
   * 得到受保护的用户名列表
   * @returns {Promise}
   * 受保护的用户数据
   */
  function getProtectedUserList() {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'getprotected', {})
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
   * 把重名用户合并到 UCenter
   * @param {string} oldusername 老用户名
   * @param {string} newusername 	新用户名
   * @param {number} uid 用户ID
   * @param {string} password 用户密码
   * @param {string} email 邮箱地址
   * @returns {Promise}
   * 大于 0:返回用户 ID，表示用户注册成功
   * -1:用户名不合法; -2:包含不允许注册的词语; -3:用户名已经存在
   */
  function merge(oldusername, newusername, uid, password, email) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'merge', {
          oldusername,
          newusername,
          uid,
          password,
          email
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
   * 移除重名用户记录
   * @param {string} username 
   */
  function removeMergedUsername(username) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'merge_remove', {
          username
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
   * 获取指定应用的指定用户积分
   * @param {number} appid 应用 ID
   * @param {number} uid 用户 ID
   * @param {number} credit 积分编号
   * @returns {Promise}
   * 积分值
   */
  function getCredit(appid, uid, credit) {
    return new Promise(function(resolve, reject) {
      ucApiPost('user', 'getcredit', {
          appid,
          uid,
          credit
        })
        .then(function(data) {
          resolve(parseInt(data) || data);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  }

  return {
    register,
    login,
    getInfo,
    editUser,
    deleteUser,
    deleteAvatar,
    syncLogIn,
    syncLogOut,
    checkEmail,
    checkName,
    addProtectedUser,
    deleteProtectedUser,
    getProtectedUserList,
    merge,
    removeMergedUsername
  };

};