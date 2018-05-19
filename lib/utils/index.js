const qs = require('querystring');
const iconv = require('iconv-lite');
const crypto = require('crypto');
const convert = require('xml-js');

module.exports = function(config) {
  return {
    parseQueryString,
    urlEncode,
    urlDecode,
    md5,
    randStr,
    unserializeXml,
  };

  /**
   * parse Query String
   * @param {*} query 
   * @returns {object}
   */
  function parseQueryString(query) {
    if (config.UC_CHARSET === 'utf8') return qs.parse(query);
    if (/^[a-zA-Z0-9%=&\-_.+~]*$/.test(query) === false) return {}; // 不符合规范

    // gbk 的情况:
    const result = {};
    query.split('&').forEach(v => {
      const tmp = v.split('=');
      result[tmp[0]] = urlDecode(tmp[1], 'gbk');
    });
    return result;
  }

  /**
   * URL Encode
   * @param {string} str PlainText for UrlEncode
   * @param {string} charset Target charset (utf8/gbk)
   * @returns {string}
   */
  function urlEncode(str, charset) {
    charset = charset || config.UC_CHARSET;
    if (charset === 'utf8') return encodeURIComponent(str);
    const rs = [];
    const encodeBuf = iconv.encode(str, charset);
    encodeBuf.forEach(v => {
      rs.push('%' + '0'.concat(parseInt(v).toString(16)).slice(-2));
    });
    return rs.join('');
  }

  /**
   * URL Decode
   * @param {string} str UrlEncoded String
   * @param {string} charset Source charset (utf8/gbk)
   * @return {string}
   */
  function urlDecode(str, charset) {
    charset = charset || config.UC_CHARSET;
    if (charset === 'utf8') return decodeURIComponent(str);

    const strLen = str.length;
    const buf = Buffer.alloc(strLen);
    for (let i = 0, j = 0; i < strLen; j++) {
      if (str[i] !== '%') {
        buf[j] = str.charCodeAt(i);
        i++;
      } else {
        buf[j] = parseInt(str.substring(i + 1, 2), 16);
        i += 3;
      }
    }
    return iconv.decode(buf, charset);
  }

  /**
   * MD5
   * @param {string} str
   * @returns {string} =MD5(msg)
   */
  function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /**
   * Generate Random String
   * @param {number} len 
   * ONLY FOR Generation of AUTHCODE KeyC
   */
  function randStr(len) {
    return crypto.randomBytes(len).map(v => 40 + v % 86).toString().replace(/\\/g, '!');
  }

  /**
   * unserialize Xml (XML 2 JS Object)
   * @param {string} xml UTF-8 XML
   * @returns {object}
   * ONLY FOR unserialize UC XML
   */
  function unserializeXml(xml) {
    return analyzeNode(convert.xml2js(xml, {compact: true}));
  }

  function analyzeNode(node) {
    if (node.root) {
        return analyzeNode(node.root);
    } else if (node.item) {
        if (/^\d+$/g.test(node.item[0]._attributes.id)) {
            return node.item.map(v => {
                return analyzeNode(v);
            });
        } else {
            const data = {};
            node.item.forEach(v => {
                data[v._attributes.id] = analyzeNode(v);
            });
            return data;
        }
    } else if (node._cdata) {
        return node._cdata;
    } else if (node._text) {
        return node._text;
    } else {
        return null;
    }
}
};