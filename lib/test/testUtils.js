function TestUtils () {
    this.oxford = require('../../lib/oxford');
    this.image = require('mongoose').model('Image');
    this.imageCtrl = require('../../controllers/images');
};

TestUtils.prototype.detectImageByIdEmotion = function (imageid, callback){
        var mainEmotion;
        var emotions;
        var err;

        try {
            this.image.findOne({_id: imageid}, function (err, image) {
                mainEmotion = image.mainemotion;
                emotions = image.emotions;

                //Main Emotion not stored in database, calculate and update db
                if(mainEmotion == undefined) {
                    return this.oxford.recognizeImageB64(image.image, function(err, emotions) {
                        console.log("Emotions array from response: " + emotions);

                        var emotionObj = this.oxford.extractMainEmotion(emotions)

                        if(emotionObj != undefined){
                            var mainEmotion = emotionObj.emotion;
                            console.log("Main emotion calculated from response: " + mainEmotion);
                            this.imageCtrl.addFieldToImage(imageid, 'mainemotion', mainEmotion, function(err, stored) {
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
            console.log("testUtils.js: " + e.stack());
        }

    };

TestUtils.prototype.generateMultipleDBdocs = function(number) {
    number = number || 0;
    var resultArray = [];

    for(var i=0; i < number; i++){
        resultArray.push(this.generateMockImageDBdoc());
        console.log(resultArray[i]);
    }
    return resultArray;

};
/**
 *
 * @returns Object {{username: string, ip: string, date: Date, image: string,
 *                  emotions: Array, mainemotion: ({emotion, max}|JSON)}}
 */
TestUtils.prototype.generateMockImageDBdoc = function() {

    var mockEmJSON = testUtils.generateMockEmotionsArray();
    var mainEmotion = this.oxford.extractMainEmotion(JSON.stringify(mockEmJSON)).emotion;
    var smiley = "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKoSURBVDhPrZU7b9NQGIaPnbi5x7k58SVp4lycC42TODFqy9IBqb+i6ZBOmSpEJf4Ff4CfwIZASExIrCysCDEhNgaEECPvG2RhJykLtXQU+5zve853ec+JEFuPJEkik8mkDcPwh4PB08V8/uW+7//k4DvnuFapVNKKomy7R78PDg5ipmmeuK77CoAfvu9/J2Q2nb7n4DvnuEabRqNxUiwWYwxi50kkEkq73V7NPe8znSau+8ZutS50XffgZOLXxLz34PT0gmu0oa3T6600TVMiUEZGmL9YfIPRR9u2l9lsNifL8s7GyWRSDAaDHCJe0pY+fcdZFQqF2MaYZNMwjrkbxqdGvX6O2uySQmj6lMtlGeBz+tAXfsfxeFyITDqdcsfjl0yBkQUwOsViLM/f+rAJ+XxeQkYbfKlUkkfD4ZK+ZGCTlDB03WeRWZdcLqfSUP4TQavT6azRzQ6hHPV6vYNU19i4RSjnLMtS6UsGWYIy4Efbti+DmiF0qdft3mD+F34fcZ7RogFPOOd53rWqqpvQ0UzR6/UuySBLQApfKQd0cR6UiRFqlUoXsMfooBNECJk4nGOkQdr0wQZzMsgSFCw1RmmEW0oIIwvXkN8EbXffcRyTDLJ2gEE0/z4CgiUQm67iiQDDKSvxuIx0HiL9GWt2GxRalNCMGW1TqZQcSTncFBgqbAYk8AJC1fYBmS5AGm0gmRvISIk0JSwbLBahLWs6mby9Nxo9K6GujJoQpgdZyc1m0+QabfRazUI2xYhstoXNKLkJjF7D6R21WLess+bh4Vm/319zjms4qrxxFGQYFfa+o8eLAjorw+lqfHT03JvNPnDwHQ24wpErE7b36LFO+";

    var objAsinDB = {
        "username" : "Carlos",
        "ip" : "192.168.34.2",
        "date" : new Date(),
        "image" : smiley,
        "emotions" : JSON.stringify(mockEmJSON),
        "mainemotion" : mainEmotion
    };
    return objAsinDB;
};

/**
 *
 * @returns {Array} of one element containing a String representing "faceRectangle" and "scores" object in it
 */
TestUtils.prototype.generateMockEmotionsArray = function() {
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


        result[0].scores = this.generateRandomScoresObj(emotionKeys, weakEmotionsKeys);
        //result[0] = JSON.stringify(result[0]);

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
