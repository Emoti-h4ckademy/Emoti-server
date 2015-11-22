var Image = require('mongoose').model('Image');
var ImageCtrl = require('../../controllers/images');
var Oxfordlib = require('../../lib/oxford');

function TestUtils () {};

TestUtils.prototype.detectImageByIdEmotion = function (imageid, callback){
        var mainEmotion;
        var emotions;
        var err;

        try {
            Image.findOne({_id: imageid}, function (err, image) {
                mainEmotion = image.mainemotion;
                emotions = image.emotions;

                //Main Emotion not stored in database, calculate and update db
                if(mainEmotion == undefined) {
                    return Oxfordlib.recognizeImageB64(image.image, function(err, emotions) {
                        console.log("Emotions array from response: " + emotions);

                        var emotionObj = Oxfordlib.extractMainEmotion(emotions)

                        if(emotionObj != undefined){
                            var mainEmotion = emotionObj.emotion;
                            console.log("Main emotion calculated from response: " + mainEmotion);
                            ImageCtrl.addFieldToImage(imageid, 'mainemotion', mainEmotion, function(err, stored) {
                                if(err){
                                    throw err;
                                }
                                console.log("emotion: " + mainEmotion);
                                callback(err, emotions, mainEmotion);
                            });
                        } else{
                            err = "Couldn't get emotion from Oxford Service";
                            console.log(new Error(err).trace);
                        }


                    });
                }
                //Main Emotion found in database, return the value
                console.log("Emotion was already in database: " + image.mainemotion);
                callback(err, emotions, mainEmotion);

            });
        } catch (e) {
            err = e;
            console.log("testUtils.js: " + e);
        }

    };

TestUtils.prototype.getMockEmotionJSON = function (){
        var mockObject = {
            "faceRectangle": {
                "left": 68,
                "top": 97,
                "width": 64,
                "height": 97
            },
            "scores": {
                "anger": 0.00300731952,
                "contempt": 5.14648448E-08,
                "disgust": 9.180124E-06,
                "fear": 0.0001912825,
                "happiness": 0.9875571,
                "neutral": 0.0009861537,
                "sadness": 1.889955E-05,
                "surprise": 0.008229999
            }
        }
        console.log("Hello from testUtils.js: getMockEmotionJSON");
        //var jsonObj = JSON.parse(mockObject);
        //console.log(jsonObj);
        return mockObject;
    };

TestUtils.prototype.resolveEmotionFromResponse = function(responseObj){
        var scores = responseObj.scores;
        if(scores != "undefined") {
            var tempVal = max = 0;
            var emotion;
            for(var key in scores) {
                tempVal = scores[key];
                if (tempVal > max) {
                    max = tempVal;
                    emotion = key;
                }
            }
            return {emotion : emotion, max: max};
        }
        console.log("Hello from testUtils.js: resolveEmotionFromResponse");
    };

TestUtils.prototype.generateMockEmotionObj = function() {
        var result = [];
        result[0] = {};

        result[0].faceRectangle = {
            "left": 68,
            "top": 97,
            "width": 64,
            "height": 97
        };

        var emotionKeys = ["neutral", "contempt", "disgust", "fear", "happiness", "anger" , "sadness", "surprise"];
        //var strongEmotionsKeys = ["anger", "happiness", "neutral", "sadness" ];
        var weakEmotionsKeys = ["contempt", "disgust", "fear"];


        result[0].scores = testUtils.generateRandomScoresObj(emotionKeys, weakEmotionsKeys);

    return result;
    };

TestUtils.prototype.generateRandomScoresObj = function(emotionKeys, weakEmotionsKeys) {
    var scoresObject = {};
    var minVal, maxVal;
    var generatedValue = 0;
    var dontGenerateHighValues = false;

    for (i in emotionKeys){
        (emotionKeys[i] === 'neutral') ? minVal = 0.4 : 0;
        if (weakEmotionsKeys.indexOf(emotionKeys[i]) > -1) {
            minVal = 0;
            maxVal = 0.009;
        } else {
            minVal = 0;
            maxVal = 1;
            if(dontGenerateHighValues) {
                minVal = 0;
                maxVal = 0.3;
            }
            if(emotionKeys[i] === 'neutral'){
                minVal = 0.3;
                maxVal = 1;
            }
        }

        generatedValue = Math.random() * (maxVal - minVal) + minVal;
        if(generatedValue > 0.6 && emotionKeys[i] != 'neutral') dontGenerateHighValues = true;

        scoresObject[emotionKeys[i]] = generatedValue;

       // console.log(emotionKeys[i] + ' = ' + scoresObject[emotionKeys[i]]);
    }
    return scoresObject;
    };

var testUtils = module.exports = exports = new TestUtils;
