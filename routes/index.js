var express = require('express');
var router = express.Router();
var ImageCtrl = require('../controllers/images');
var Image = require('../models/image');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Emoti' });
});


router.get('/show-images', function(req, res) {
    ImageCtrl.getImagesStoredWithEmotions(0, function(error, allImages){
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

router.get('/charts', function(req, res) {
    res.render('charts');
});


module.exports = router;
