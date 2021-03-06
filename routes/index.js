var express = require('express');
var router = express.Router();
var ImageCtrl = require('../controllers/images');
var Image = require('../models/image');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Emoti' });
});


router.get('/show-images', function(req, res) {
  ImageCtrl.returnAllImages(function(error, allImages){
    res.render('images',
        {
          myimages : allImages/*,
          helpers: {
              base64decode: function(base64str)
                            {
                              return new Buffer(base64str, 'base64');
                            }
          }*/
    });
  });

});


module.exports = router;
