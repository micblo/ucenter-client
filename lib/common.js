//
// UCenter Client Common Functions
//
const request = require('request');
const iconv = require('iconv-lite');

const UC_CLIENT_VERSION = '1.6.0';
const UC_CLIENT_RELEASE = '210501';

const UserAgent = `UC Client Node v${UC_CLIENT_VERSION}`;

module.exports = function(config) {
  const {
    md5,
    randStr,
    urlEncode,
    urlDecode
  } = require('./utils')(config);

  return {
    ucAuthCode,
    ucApiUrl,
    ucApiPost,
    ucApiRequestData,
    ucApiInput,
  };

  function ucApiUrl(module, action, arg, extra) {
    return config.UC_API + '/index.php?' + ucApiRequestData(module, action, arg, extra);
  }

  /**
   * Do API Post
   * Post a message to UCenter Server
   * @param {string} module 
   * @param {string} action 
   * @param {object} args
   * @returns {Promise}
   */
  function ucApiPost(module, action, args) {
    return new Promise(function(resolve, reject) {
      const url = config.UC_API + '/index.php';
      const postData = ucApiRequestData(module, action, buildPostQS(args));

      request.post(url, {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          'User-Agent': UserAgent,
          'Connection': 'Close',
          'Cache-Control': 'no-cache',
          'Cookie': ''
        },
        body: postData,
        encoding: null,
        timeout: 20000
      }, function(err, req, body) {
        if (err) {
          return reject('连接用户服务器失败');
        } else if (body.indexOf('Access Denied') === 0) {
          return reject('无权限访问接口');
        } else if (body.indexOf('Access denied for agent changed') === 0) {
          return reject('通信签名生成错误');
        } else if (body.indexOf('Authorization has expired') === 0) {
          return reject('签名已过期');
        } else if (body.indexOf('Invalid input') === 0) {
          return reject('无数据输入');
        }
        if (config.UC_CHARSET !== 'utf8') {
          body = iconv.decode(body, config.UC_CHARSET);
        } else {
          body = body.toString();
        }
        resolve(body);
      });
    });

    function buildPostQS(args) {
      args = args || {}; // Empty Arguments
      let sep = '';
      let s = '';
      for (let k in args) {
        const key = encodeURIComponent(k || '');
        const v = args[k || ''];

        if (v !== null && (Array.isArray(v) || typeof v === 'object')) {
          let s2 = '';
          let sep2 = '';
          for (let k2 in v) {
            const key2 = urlEncode(k2 || '');
            s2 += `${sep2}{${key}}[${key2}]=${urlEncode(v[k2 || ''])}`;
            sep2 = '&';
          }
          s += sep + s2;
        } else {
          s += `${sep}${key}=${urlEncode(v)}`;
        }
        sep = '&';
      }
      
      return s;
    }
  }

  /**
   * Build API Request Data
   * @param {string} module 
   * @param {string} action 
   * @param {string} arg 
   * @param {string} extra
   * @returns {string}
   */
  function ucApiRequestData(module, action, arg, extra) {
    const input = ucApiInput(arg);
    return `m=${module}&a=${action}&inajax=2&release=${UC_CLIENT_RELEASE}&input=${input}&appid=${config.UC_APPID}${extra || ''}`;
  }

  /**
   * Build API Input param
   * @param {*} data 
   */
  function ucApiInput(data) {
    const time = ~~(Date.now() / 1000); // Create Timestamp
    const sign = data + '&agent=' + md5(UserAgent) + "&time=" + time; // Build sign plaintext
    // console.log('ucApiInput:', sign);
    const authCode = ucAuthCode(sign, 'ENCODE', config.UC_KEY); // Build Auth Code
    // console.log('authCode:', authCode);
    return urlEncode(authCode, 'utf8'); // Do URL Encode
  }

  /**
   * Do UC AuthCode
   * @param {*} str 
   * @param {*} operation ENCODE / DECODE
   * @param {*} key 
   * @param {*} expiry Exipred time
   */
  function ucAuthCode(str, operation, key, expiry) {
    if (!operation) operation = 'DECODE'; // DEFAULT OP is DECODE

    const ckeyLength = 4; // ckey Length
    const nowTime = ~~(Date.now() / 1000);

    key = md5(key || config.UC_KEY);
    const keyA = md5(key.substr(0, 16));
    const keyB = md5(key.substr(16, 16));
    if (!ckeyLength) return '';
    let keyC = operation === 'DECODE' ? str.substr(0, ckeyLength) : randStr(ckeyLength);
    const cryptKey = keyA + md5(keyA + keyC);
    const keyLength = cryptKey.length;

    if (operation === 'DECODE') {
      str = Buffer.from(str.substr(ckeyLength), 'base64');
    } else {
      if (expiry) {
        expiry += nowTime;
      } else {
        expiry = 0;
      }
      str = Buffer.from('0000000000'.concat(expiry).slice(-10) + md5(str + keyB).substr(0, 16) + str);
    }

    const strLength = str.length;
    const result = Buffer.alloc(strLength);

    // Generate SBox
    const box = [];
    const rndKey = [];
    for (let i = 0; i <= 255; i++) {
      box[i] = i;
      rndKey[i] = cryptKey.charCodeAt(i % keyLength);
    }

    for (let j = 0, i = 0; i < 256; i++) {
      j = (j + box[i] + rndKey[i]) % 256;
      const tmp = box[i];
      box[i] = box[j];
      box[j] = tmp;
    }

    // Replace PlainText / CipherText
    for (let a = 0, j = 0, i = 0; i < strLength; i++) {
      a = (a + 1) % 256;
      j = (j + box[a]) % 256;
      const tmp = box[a];
      box[a] = box[j];
      box[j] = tmp;
      result[i] = str[i] ^ (box[(box[a] + box[j]) % 256]);
    }

    // Check Decoded Data
    if (operation === 'DECODE') {
      const finalResult = result.toString();
      const expiredTime = parseInt(finalResult.substr(0, 10));
      if (expiredTime !== 0 && expiredTime - nowTime > 0) return '';
      const sign = Buffer.concat([result.slice(26), Buffer.from(keyB)]);
      if (finalResult.substr(10, 16) === md5(sign).substr(0, 16)) {
        if (config.UC_CHARSET === 'utf8') {
          return finalResult.substr(26);
        } else {
          return iconv.decode(result.slice(26), config.UC_CHARSET);
        }
      } else {
        return '';
      }
    } else {
      // Format Encoded Data
      return keyC + result.toString('base64').replace(/=/g, '');
    }
  }
};