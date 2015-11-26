/**
 * Created by Carlos on 6/11/15.
 */
var express = require('express');
var router = express.Router();
var ImageCtrl = require('../../controllers/images');
var TestUtils = require('../../lib/test/testUtils');


/* GET charts listing. */
router.get('/', function(req, res) {
    var month = new Date().getMonth();

    ImageCtrl.getImageByMonth(month, function(err, images){
        var data = [];
        var resultObj;
        var days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
        for (var i = 0; i < days.length; i++){
            resultObj = {};
            resultObj.day = days[i];
            var scores = JSON.parse(images[i].emotions)[0].scores;
            for (var key in scores){
                var attrName = key;
                var attrValue = scores[key];
               // console.log("attrName: " + attrName);
                //console.log("attrValue: " + attrValue);

                resultObj[attrName] = attrValue;
                //console.log("obj: " + obj);
            }
            data.push(resultObj);
        }

        res.json(data);
    });
    //res.json(data);
});

router.get('/demo', function(req, res) {
    var month = new Date().getMonth();
    var username = 'Carlos'

    ImageCtrl.getImagesbyUsername(0, username, function(err, images){
        var data = [];
        var resultObj = {"anger" : 0, "contempt" : 0, "disgust" : 0, "fear" : 0, "happiness" : 0, "neutral" : 0,
            "sadness" : 0, "surprise" : 0, "fear" : 0 };
        for (var i = 0; i < images.length; i++) {
            if (resultObj[images[i].mainemotion] >= 0)
                resultObj[images[i].mainemotion]++;
        }
        console.log(resultObj);
        data.push(resultObj);

        res.json(data);
    });

    //res.json(data);
});

module.exports = router;


