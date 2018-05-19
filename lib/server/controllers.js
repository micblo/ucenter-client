//
// UCenter Client Server
// 用于接收UCenter发送的消息
//

module.exports = {
    // 通信测试接口
    test: () => {},

    // 接收用户删除通知
    deleteuser: ({
      query: {
        ids
      }
    }) => ({
      ids: (ids || '').split(',').map(v => parseInt(v))
    }),

    // 接收用户名修改通知
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

    // 接收密码修改通知
    updatepw: ({
      query: {
        username,
        password
      }
    }) => ({
      username,
      password
    }),

    // 同步登录
    synlogin: ({
      query: {
        uid
      }
    }) => ({
      uid: parseInt(uid)
    }),

    // 同步退出
    synlogout: () => {},

    // TODO: 更新敏感词清单
    updatebadwords: () => {},

    // 更新当前系统积分
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

    // 传递当前系统的积分设定
    getcreditsettings: () => {},

    // TODO: 接受当前系统的积分设定
    updatecreditsettings: ({
      query: {
        credit
      }
    }) => {

    },
    
    // 获取当前系统的积分值
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