'use strict';

module.exports = function(app, db) {
  app.get('/new/:user_id', function(req, res) {
    res.json({
      pageType: 'index'
    });
  });
};
