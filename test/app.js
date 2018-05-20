const assert = require('assert');
const UC_CONFIG = require('./server.config.json');
const uc = require('../index')(UC_CONFIG);

describe('App', function() {
  describe('#getAppList()', function() {
    it('should be integrated', function() {
      return uc.app.getAppList()
        .then(function(data) {
          assert.equal(Object.keys(data).length > 0, true);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });
  });
});