'use strict';

module.exports = function(app, hasValidId) {
  app.get('/new/:user_id', function(req, res) {
    res.json({
      pageType: 'index'
    });
  });
};
