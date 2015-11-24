function TestUtils () {
    this.oxford = require('../../lib/oxford');
    this.image = require('mongoose').model('Image');
    this.imageCtrl = require('../../controllers/images');
};

TestUtils.prototype.detectImageByIdEmotion = function (imageid, callback){
    console.log("detect " + imageid);
    
    this.image.findOne({_id: imageid}, function (err, image) {
        if (!err) {
            var mainEmotion = image.mainemotion;
            var emotions = image.emotions;

            if (!mainEmotion) {
                this.imageCtrl.checkDocument(image, function (error, image) {
                    if (error) {
                        callback (error, undefined, undefined);
                        return;
                    }
                    mainEmotion = image.mainemotion;
                    emotions = image.emotions;
                });
            }
            callback(err, image.emotions, image.mainemotion);
            return;
        } else {
            callback (err, undefined, undefined);
        }

    });

};

TestUtils.prototype.getDaysInMonth = function (month, year) {
    // Since no month has fewer than 28 days
    var date = new Date(year, month, 1);
    var days = [];
    //console.log('month', month, 'date.getMonth()', date.getMonth());
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}


TestUtils.prototype.generateMockDataforMonth = function (month, save) {
    var currentDate = new Date();
    month = month || currentDate.getMonth();

    var days = this.getDaysInMonth(month, currentDate.getYear());
    var resultArray = [];

    for(var i=0; i < days.length; i++){
        resultArray.push(this.generateMockImageDBdoc());
        date = new Date();
        date.setMonth(month);
        date.setDate(i);
        resultArray[i].date = date;
        if(save) {
            this.imageCtrl.addMockImage(resultArray[i], function(error, store){
                if(error) {
                    console.log("Error trying to save image:");
                } else {
                    console.log("Image successfully saved in database: id = " + store._id + ", date = " + store.date);
                }
            });
        }
        // console.log(resultArray[i]);
    }
    return resultArray;
}

/**
 *
 * @param number The number of documents we want to generate
 * @param boolean save in database if true
 * @returns {Array} Containing an Object which parameters correspond to document fields
 */
TestUtils.prototype.generateMultipleDBdocs = function(number, save) {
    number = number || 0;
    var resultArray = [];

    for(var i=0; i < number; i++){
        resultArray.push(this.generateMockImageDBdoc());
        if(save) {
            this.imageCtrl.addMockImage(resultArray[i], function(error, store){
                if(error) {
                    console.log("Error trying to save image:");
                } else {
                    console.log("Image successfully saved in database: id = " + store._id + ", date = " + store.date);
                }
            });
        }
       // console.log(resultArray[i]);
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
    var smiley = "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKoSURBVDhPrZU7b9NQGIaPnbi5x7k58SVp4lycC42TODFqy9IBqb+i6ZBOmSpEJf4Ff4CfwIZASExIrCysCDEhNgaEECPvG2RhJykLtXQU+5zve853ec+JEFuPJEkik8mkDcPwh4PB08V8/uW+7//k4DvnuFapVNKKomy7R78PDg5ipmmeuK77CoAfvu9/J2Q2nb7n4DvnuEabRqNxUiwWYwxi50kkEkq73V7NPe8znSau+8ZutS50XffgZOLXxLz34PT0gmu0oa3T6600TVMiUEZGmL9YfIPRR9u2l9lsNifL8s7GyWRSDAaDHCJe0pY+fcdZFQqF2MaYZNMwjrkbxqdGvX6O2uySQmj6lMtlGeBz+tAXfsfxeFyITDqdcsfjl0yBkQUwOsViLM/f+rAJ+XxeQkYbfKlUkkfD4ZK+ZGCTlDB03WeRWZdcLqfSUP4TQavT6azRzQ6hHPV6vYNU19i4RSjnLMtS6UsGWYIy4Efbti+DmiF0qdft3mD+F34fcZ7RogFPOOd53rWqqpvQ0UzR6/UuySBLQApfKQd0cR6UiRFqlUoXsMfooBNECJk4nGOkQdr0wQZzMsgSFCw1RmmEW0oIIwvXkN8EbXffcRyTDLJ2gEE0/z4CgiUQm67iiQDDKSvxuIx0HiL9GWt2GxRalNCMGW1TqZQcSTncFBgqbAYk8AJC1fYBmS5AGm0gmRvISIk0JSwbLBahLWs6mby9Nxo9K6GujJoQpgdZyc1m0+QabfRazUI2xYhstoXNKLkJjF7D6R21WLess+bh4Vm/319zjms4qrxxFGQYFfa+o8eLAjorw+lqfHT03JvNPnDwHQ24wpErE7b36LFO+y4HnhrO825kPavVqlar1dLYKAaQeuvlEBT+Tq+vAHqnF2wA/d+/gN8GNu2VWV84VAAAAABJRU5ErkJggg==";

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

        //var emotionKeys = ["neutral", "contempt", "disgust", "fear", "happiness", "anger" , "sadness", "surprise"];
        //var strongEmotionsKeys = ["anger", "happiness", "neutral", "sadness" ];
       // var weakEmotionsKeys = ["contempt", "disgust", "fear"];


        //result[0].scores = this.generateRandomScoresObj(emotionKeys, weakEmotionsKeys);
        result[0].scores = this.generateRandomScoresObjSummingOne();

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


TestUtils.prototype.generateRandomScoresObjSummingOne = function() {
    var randomBetweenValues = function (max, min) { return Math.random() * (max - min) + min; }

    var scoresObject = {
        "anger": 0.00300731952,
        "contempt": 5.14648448E-08,
        "disgust": 9.180124E-06,
        "fear": 0.0001912825,
        "happiness": 0.9875571,
        "neutral": 0.0009861537,
        "sadness": 1.889955E-05,
        "surprise": 0.008229999
    };
    var totalMax = 1;

    scoresObject.neutral = randomBetweenValues(0.8, 0.1);
    totalMax = totalMax - scoresObject.neutral;
    scoresObject.disgust = randomBetweenValues(0.05, 0);
    totalMax = totalMax - scoresObject.disgust;
    scoresObject.contempt = randomBetweenValues(0.05, 0);
    totalMax = totalMax - scoresObject.contempt;
    scoresObject.fear = randomBetweenValues(0.05, 0);
    totalMax = totalMax - scoresObject.fear;
    scoresObject.happiness = randomBetweenValues(totalMax, 0);
    totalMax = totalMax - scoresObject.happiness;
    scoresObject.anger = randomBetweenValues(totalMax, 0);
    totalMax = totalMax - scoresObject.anger;
    scoresObject.sadness = randomBetweenValues(totalMax, 0);
    totalMax = totalMax - scoresObject.sadness;
    scoresObject.surprise = randomBetweenValues(totalMax, 0);

    return scoresObject;
};
var testUtils = module.exports = exports = new TestUtils;
