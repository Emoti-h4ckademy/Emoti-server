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

// GET emotion for an image knowing its id
router.post('/emotiondetect/:imageid', function(req, res, next) {
    try {
        return TestUtils.detectEmotion(req.params.imageid, function (err, emotion) {
            console.log("Emotion calculated:" + emotion);
            return res.status(200).jsonp(emotion);
        });
    } catch (error){
        console.log("image.js: " + error);
    }
    next();
});

module.exports = router;


