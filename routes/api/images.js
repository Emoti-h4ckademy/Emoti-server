/**
 * Created by Carlos on 6/11/15.
 */
var express = require('express');
var router = express.Router();
var ImageCtrl = require('../../controllers/images');
var TestUtils = require('../../lib/test/testUtils');


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

// POST emotion for an image knowing its id
router.post('/emotiondetect/:imageid', function(req, res, next) {
    try {
        return TestUtils.detectImageByIdEmotion(req.params.imageid, function (err, emotionObj, mainEmotion) {
            console.log("Main emotion in detectImageByIdEmotion: " + mainEmotion);
            return res.status(200).jsonp(emotionObj);
        });
    } catch (error){
        console.log("image.js: " + error);
    }
    next();
});

module.exports = router;


