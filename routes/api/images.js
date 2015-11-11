/**
 * Created by Carlos on 6/11/15.
 */
var express = require('express');
var router = express.Router();
var ImageCtrl = require('../../controllers/images');


/* GET images listing. */
router.get('/', function(req, res, next) {
    return ImageCtrl.returnAllImages(function(err, images){
        if(err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(images);
    });
    next();
});

router.route('/').post(ImageCtrl.addImage);

/*router.post('/', function(req, res, next) {
    return ImageCtrl.addImage(function(err, images){
        if(err) {
            console.log(err);
            return res.send(err);
        }
        return res.send(images);
    });
    next();
});*/

/*router.get('/beautiful-images', function(req, res, next) {
    res.send('Beautiful images should be found here!');
    next();
});

router.route('/')
    .get(ImageCtrl.findAllImages)
    .post(ImageCtrl.addImage);

router.route('/other')
    .get(ImageCtrl.returnAllImages)
    .post(ImageCtrl.addImage);*/


module.exports = router;


