var express = require('express');
var router = express.Router();
var ImageCtrl = require('../controllers/images');
var Image = require('../models/image');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Emoti' });
});

router.get('/template1', function(req, res, next) {
  res.render('images', ImageCtrl.findAllImages(req, res));
});

router.get('/template2', function(req, res) {
  ImageCtrl.returnAllImages(function(error, allImages){
    res.render('images',
        {
          myimages : allImages,
          helpers: {
              base64decode: function(base64str)
                            {
                              return new Buffer(base64str, 'base64');
                            }
          }
    });
  });

});

router.get('/template3', function (req, res) {
  var query = Image.find({}).limit(10);
  query.exec(function (err, images) {
    if (err) {
      throw Error;
    }
    res.render('home', {myimages: images});
  });
});

module.exports = router;
