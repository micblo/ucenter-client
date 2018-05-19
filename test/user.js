const assert = require('assert');
const url = require('url');
const qs = require('querystring');
const UC_CONFIG = require('./server.config.json');
const uc = require('../index')(UC_CONFIG);
const Common = require('../lib/common')(UC_CONFIG);

describe('User', function() {
  describe('#addProtectedUser()', function() {
    it('should be true', function() {
      return uc.user.addProtectedUser('测试test123', 'root')
        .then(function(data) {
          assert.equal(data, true);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });
  });

  describe('#getProtectedUserList()', function() {
    it('should include "测试test123"', function() {
      return uc.user.getProtectedUserList()
        .then(function(data) {
          assert.equal(data.some(function (v) {
            return v.username === '测试test123';
          }), true);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });
  });

  describe('#deleteProtectedUser()', function() {
    it('should be true', function() {
      return uc.user.deleteProtectedUser('测试test123')
        .then(function(data) {
          assert.equal(data, true);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });
  });

  describe('#syncLogIn()', function() {
    it('should include Scripts', function() {
      return uc.user.syncLogIn(1)
        .then(function(data) {
          const rs = /<script type="text\/javascript" src="([^"]+)" reload="1"><\/script>/g.exec(data);
          if (!rs) return assert.fail(`Failed to match: ${data}`);

          const code = qs.parse(url.parse(rs[1]).search.slice(1)).code;
          const decodedData = qs.parse(Common.ucAuthCode(code, 'DECODE', UC_CONFIG.UC_KEY));
          
          assert.equal(decodedData.action, 'synlogin');
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });
  });

  describe('#syncLogOut()', function() {
    it('should include Scripts', function() {
      return uc.user.syncLogOut()
        .then(function(data) {
          const rs = /<script type="text\/javascript" src="([^"]+)" reload="1"><\/script>/g.exec(data);
          if (!rs) return assert.fail(`Failed to match: ${data}`);

          const code = qs.parse(url.parse(rs[1]).search.slice(1)).code;
          const decodedData = qs.parse(Common.ucAuthCode(code, 'DECODE', UC_CONFIG.UC_KEY));
          
          assert.equal(decodedData.action, 'synlogout');
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });
  });

  describe('#checkName()', function() {
    it('should return 1 when username is valid', function() {
      return uc.user.checkName('Adwe32x23fa')
        .then(function(data) {
          assert.equal(data, 1);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });

    it('should return -1 when username includes invalid symbols', function() {
      return uc.user.checkName('sd*23dx3)_')
        .then(function(data) {
          assert.equal(data, -1);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });

    it('should return -2 when username includes invalid words', function() {
      return uc.user.checkName('习近平最帅69')
        .then(function(data) {
          assert.equal(data, -2);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });

    it('should return -3 when username exists', function() {
      return uc.user.checkName('测试test123')
        .then(function(data) {
          assert.equal(data, -3);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });
  });

  
  describe('#checkEmail()', function() {
    it('should return 1 when email is valid', function() {
      return uc.user.checkEmail('Adwe32x23fa@aaecsdsd.com')
        .then(function(data) {
          assert.equal(data, 1);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });

    it('should return -4 when email is invalid', function() {
      return uc.user.checkEmail('sd*23dx3)_@')
        .then(function(data) {
          assert.equal(data, -4);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });

    it('should return -5 when username includes invalid words', function() {
      return uc.user.checkEmail('123@10minutemail.net')
        .then(function(data) {
          assert.equal(data, -5);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });

    it('should return -6 when email exists', function() {
      return uc.user.checkEmail('123@qq.com')
        .then(function(data) {
          assert.equal(data, -6);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });
  });
});