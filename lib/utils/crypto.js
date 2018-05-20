const crypto = require('crypto');

module.exports = {
  md5,
  randStr
};

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