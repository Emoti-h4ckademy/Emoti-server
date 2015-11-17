var testUtils = module.exports = {

    detectEmotion: function (imageid, callback){
        var oxfordResponse = testUtils.getMockEmotionJSON();
        var emotionObject = testUtils.resolveEmotionFromResponse(oxfordResponse);
        console.log("Imageid from client: " + imageid);
        callback(null, {emotion: emotionObject.emotion, coef: emotionObject.max, oxfordResponse : oxfordResponse});
    },

    getMockEmotionJSON: function (){
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
    },
    resolveEmotionFromResponse: function(responseObj){
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
    }

}