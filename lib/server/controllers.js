//
// UCenter Client Server
// 用于接收UCenter发送的消息
//

module.exports = {
    /**
     * 通信测试接口
     */
    test: () => {},

    /**
     * 接收用户删除通知
     * @param {Array} ids 被删除的ID数组
     */
    deleteuser: ({
      query: {
        ids
      }
    }) => ({
      ids: (ids || '').split(',').map(v => parseInt(v))
    }),

    /**
     * 接收用户名修改通知
     * @param {number} uid 用户 ID
     * @param {string} oldusername 旧用户名
     * @param {string} newusername 新用户名
     */
    renameuser: ({
      query: {
        uid,
        oldusername: oldUsername,
        newusername: newUsername
      }
    }) => ({
      uid: parseInt(uid),
      oldUsername,
      newUsername
    }),

    /**
     * 接收密码修改通知
     * @param {string} username 用户名
     * @param {string} password 新密码
     */
    updatepw: ({
      query: {
        username,
        password
      }
    }) => ({
      username,
      password
    }),

    /**
     * 同步登录
     * @description 收到通知后登录该用户 ID对应的账号
     * @param {number} 登录的用户 ID
     */
    synlogin: ({
      query: {
        uid
      }
    }) => ({
      uid: parseInt(uid)
    }),

    /**
     * 同步退出
     * @description 收到通知后及时清除现在的登录状态
     */
    synlogout: () => {},

    /**
     * 更新敏感词清单
     * @param {Array} word_list 敏感词清单
     */
    updatebadwords: (body) => body,

    /**
     * 更新当前系统积分
     * @param {number} uid 用户 ID
     * @param {number} credit 积分编号
     * @param {number} amount 积分的增减值（可以是负数）
     */
    updatecredit: ({
      query: {
        uid,
        credit,
        amount
      }
    }) => ({
      uid: parseInt(uid),
      creditId: parseInt(credit),
      amount: parseInt(amount)
    }),

    /**
     * 通知传递当前系统的积分设定
     */
    getcreditsettings: () => {},

    // 接收 UCenter 积分兑换设置的参数
    updatecreditsettings: ({
      query: {
        credit
      }
    }) => {
      // TODO: 解析方式未知
    },
    
    /**
     * 获取当前系统的积分值
     * @param {number} uid 用户 ID
     * @param {number} credit 积分编号
     */
    getcredit: ({
      query: {
        uid,
        credit
      }
    }) => ({
      uid: parseInt(uid),
      creditId: parseInt(credit)
    }),
  };