var express = require('express');
var router = express.Router();
var ImageCtrl = require('../controllers/images');
var Image = require('../models/image');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Emoti' });
});


router.get('/show-images', function(req, res) {
    var myOptions = ImageCtrl.getNewOptions();
    myOptions.queryUsername = "Demo";
    myOptions.returnImage = true;
    myOptions.filterHasEmotions = false;
    ImageCtrl.getImages(myOptions, function(error, allImages){
        if (error) {
            console.log("FAILURE RETRIEVING IMAGES");
        } else {
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
        }
    });

});

router.get('/charts', function(req, res) {
    res.render('charts');
});


module.exports = router;
