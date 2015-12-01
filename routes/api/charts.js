/**
 * Created by Carlos on 6/11/15.
 */
var express = require('express');
var router = express.Router();
var ImageCtrl = require('../../controllers/images');
var TestUtils = require('../../lib/test/testUtils');


/* GET charts listing. */
router.get('/week', function(req, res) {    
    var myOptions = ImageCtrl.getNewOptions();
   // myOptions.queryUsername = "Carlos";
    myOptions.returnImage = false;

    ImageCtrl.getImages(myOptions, function(error, allImages){
        var data = [];
        var resultObj;
        var days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
        for (var i = 0; i < days.length; i++){
            resultObj = {};
            resultObj.day = days[i];
            var scores = JSON.parse(allImages[i].emotions)[0].scores;
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
    var myOptions = ImageCtrl.getNewOptions();
    //myOptions.queryUsername = "Carlos";
    myOptions.returnImage = false;
    
    var resultObj = {};
    ImageCtrl.getImages(myOptions, function(error, allImages){
        if (error) {
            console.log("ERROR RETRIEVING IMAGES");
        } else {
            var data = [];
            resultObj = {"anger" : 0, "contempt" : 0, "disgust" : 0, "fear" : 0, "happiness" : 0, "neutral" : 0, "sadness" : 0, "surprise" : 0 };
            for (var i = 0; i < allImages.length; i++) {
                if (resultObj[allImages[i].mainemotion] >= 0)
                    resultObj[allImages[i].mainemotion]++;
            }
        }
        console.log(resultObj);
        data.push(resultObj);
        res.json(data);
    });

    //res.json(data);
});

module.exports = router;


