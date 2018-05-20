const url = require('url');

const Server = require('./server');
const Client = require('./client');

module.exports = function(config) {
  initClient(config);

  return {
    clientCtx: Server(config),
    user: Client.user(config),
    pm: Client.pm(config),
    friend: Client.friend(config),
    credit: Client.credit(config),
    avatar: Client.avatar(config),
    feed: Client.feed(config),
    tag: Client.tag(config),
    app: Client.app(config),
    mail: Client.mail(config),
    utils: require('./utils')(config)
  };

  /**
   * 初始化UCenter客户端
   * @param {object} config 
   * @throws {Error}
   */
  function initClient(config) {
    if (/^[a-zA-Z0-9]{1,64}$/.test(config.UC_KEY || '') === false) {
      throw new Error('UC_KEY 必须设置为 通信密钥');
    }
    if ((/^gbk|utf8$/).test(config.UC_CHARSET || '') === false) {
      throw new Error('UC_CHARSET 必须设置为 gbk 或 utf8，且必须和UC的字符集一致，否则将出现乱码！');
    }

    let apiParsed;
    try {
      apiParsed = url.parse(config.UC_API || '');
    } catch (e) {
      throw new Error('UC_API 必须设置为 UCenter 的根目录URL（结尾不要加 /）');
    }
    if (!apiParsed.host || !apiParsed.protocol || config.UC_API.slice(-1) === '/') {
      throw new Error('UC_API 必须设置为 UCenter 的根目录URL（结尾不要加 /）');
    }

    if (typeof config.UC_APPID !== 'number') {
      throw new Error('UC_APPID 必须设置为当前应用的ID，ID可在UCenter查看！');
    }

    if (!config.UC_IP) {
      throw new Error('UC_IP 必须设置为 UCenter 服务器的IP地址！');
    }
  }

};