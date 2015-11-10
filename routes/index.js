var express = require('express');
var router = express.Router();
var ImageCtrl = require('../controllers/images');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Emoti' });
});

router.get('/template1', function(req, res, next) {
  res.render('images', ImageCtrl.findAllImages(req, res));
});

router.get('/template2', function(req, res) {
  res.render('images', ImageCtrl.returnAllImages());
});

module.exports = router;
