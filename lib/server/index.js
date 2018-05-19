//
// UCenter Client Server
// 
// UCenter Server send Message to Client Server
//

const Controllers = require('./controllers');

const API_RETURN_SUCCEED = '1';
const API_RETURN_FAILED = '-1';

/**
 * UCenter Client Server
 * @param {*} config 
 */
module.exports = (config) => {
  /**
   * Input:
   * @param {object} query queryString 
   * @param {string} body  postData(XML Object)
   */
  return (query, body, callback) => {
    return new Promise((resolve, reject) => {

      // Check whether `query` and `query.code` exists
      if (query === null || typeof query !== 'object' || !query.code) {
        return reject(new Error('请求的QueryString不存在'));
      }
      if (body) {
        //TODO: XML serilize

      }

      // Decrypt AuthCode
      const decodedStr = ucAuthCode(query.code, 'DECODE', config.UC_KEY);
      // Parse decrypted QueryString
      const parsedQS = parseQueryString(decodedStr);

      // decodedParams: query + body
      const decodedParams = {
        query
      };
  
      const {
        action,
        time
      } = parsedQS;

      // Invalid request / Invalid Key
      if (!time || /^\d+$/.test(time) === false) {
        return reject(new Error('解密数据失败'));
      }
  
      // Expired request
      if (~~(Date.now() / 1000) - parseInt(time) > 3600) {
        return reject(new Error('过期的请求'));
      }
  
      // Check Action
      const validAction = [
        'test', 'deleteuser', 'renameuser', //'gettag',
        'synlogin', 'synlogout',
        'updatepw', 'updatebadwords', //'updatehosts', 'updateapps', 'updateclient',
        'updatecredit', 'getcreditsettings', 'updatecreditsettings'
      ].some(v => v === action && controllers[v]);
      if (!validAction) {
        return reject(new Error(`不存在的Action: ${action}`));
      }
  
      // Do Action
      resolve({
        resCode: API_RETURN_SUCCEED, // respond body
        action, // action name
        data: controllers[action](decodedParams) // recieved data
      });
    });
  };
};