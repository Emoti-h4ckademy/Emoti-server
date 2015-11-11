/**
 * Created by Carlos on 6/11/15.
 */
var express = require('express');
var router = express.Router();
var ImageCtrl = require('../../controllers/images');



/* GET users listing. */

router.get('/beautiful-images', function(req, res, next) {
    res.send('Beautiful images should be found here!');
    next();
});

router.get('/miau', function(req, res, next) {
    ImageCtrl.returnAllImages(function(err, images) {
        if(err) res.send(500, err.message);

        console.log('GET /images')
        res.status(200).jsonp(images);
    });
    next();
});


router.route('/')
    .get(ImageCtrl.findAllImages)
    .post(ImageCtrl.addImage);

router.route('/other')
    .get(ImageCtrl.returnAllImages)
    .post(ImageCtrl.addImage);


//app.use('/api', router);

module.exports = router;


