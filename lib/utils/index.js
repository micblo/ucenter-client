module.exports = function(config) {
  const {
    md5,
    randStr
  } = require('./crypto');
  const {
    parseQueryString,
    urlEncode,
    urlDecode,
    serializeXml,
    unserializeXml,
  } = require('./string')(config);

  return {
    parseQueryString,
    urlEncode,
    urlDecode,
    md5,
    randStr,
    serializeXml,
    unserializeXml,
  };
};