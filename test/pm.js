const assert = require('assert');
const url = require('url');
const qs = require('querystring');
const UC_CONFIG = require('./server.config.json');
const uc = require('../index')(UC_CONFIG);
const Common = require('../lib/common')(UC_CONFIG);

describe('PM', function() {
  describe('#checkNew()', function() {
    it('should include newpm when more is 0', function() {
      return uc.pm.checkNew(1)
        .then(function(data) {
          assert.equal(data.newpm !== undefined, true);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });

    it('should include newpm and newprivatepm when more is 1', function() {
      return uc.pm.checkNew(1, 1)
        .then(function(data) {
          assert.equal(data.newpm !== undefined && data.newprivatepm !== undefined, true);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });
    
    it('should include newpm, newprivatepm and newchatpm when more is 2', function() {
      return uc.pm.checkNew(1, 2)
        .then(function(data) {
          assert.equal(
            data.newpm !== undefined && 
            data.newprivatepm !== undefined && 
            data.newchatpm !== undefined, true);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });

    
    it('should include private message detail info when more is 3', function() {
      return uc.pm.checkNew(1, 3)
        .then(function(data) {
          assert.equal(
            data.newpm !== undefined && 
            data.newprivatepm !== undefined && 
            data.newchatpm !== undefined &&
            data.lastdate !== undefined &&
            data.lastmsgfromid !== undefined &&
            data.lastmsgfrom !== undefined &&
            data.lastmsg !== undefined, true);
        })
        .catch(function(err) {
          assert.fail(err);
        });
    });
  });
});