var config = require('config'),
    request = require('request');

/**
 * Oxford constructor.
 *
 * The exports object of the `oxford` module is an instance of this class.
 * Most apps will only use this one instance.
 *
 * @api public
 */

function Oxford () {
    this.oxfordApiKey = config.get('emotionAPIKey');
    this.oxfordUrl = config.get('emotionURL');
};



Oxford.prototype.detectEmotion = function (imageid, callback){
        var oxfordResponse = testUtils.getMockEmotionJSON();
        var emotionObject = testUtils.resolveEmotionFromResponse(oxfordResponse);
        console.log("Imageid from client: " + imageid);
        callback(null, {emotion : emotionObject.emotion, coef : emotionObject.max, oxfordResponse : oxfordResponse});
};

Oxford.prototype.extractMainEmotionFromResponse = function(responseObj){
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
};

/**
 * Parses the response of the Oxford API returning to check for errors
 * @param {type} response - Response from the API
 * @param {type} callback - Function to be callback
 *      1st param will be error
 *      2nd parameter will be the emotion array
 * @returns {undefined}
 */
Oxford.prototype._parseResponse = function (response, callback) {
        var emotion;
        var err;
        if (response.statusCode !== 200) {
            err = response.statusMessage;
            var message;
            try {
                message = JSON.parse(response.body).message;
            } catch (err) {
                message = response.body;
            }
            err += ": " + message;
            emotion = "{}";
        } else {
            err = false;
            emotion = response.body;
        }

        callback (err, emotion);
    },

/**
 * Handles the comunication with the API
 * @param {type} image Image to be sent
 * @param {type} callback Function to be callback
 * @returns {undefined}
 */
Oxford.prototype._getEmotion = function (image, callback) {
        var self = this;
        //API setup
        var oxfordContentType = "application/octet-stream";

        return request({
            url: self.oxfordUrl,
            method: "POST",
            json: false,
            body: image,
            headers: {
                    "content-type" : oxfordContentType,
                    "Ocp-Apim-Subscription-Key" : self.oxfordApiKey
                }
            }, function (error, response, body) {
                self._parseResponse(response, callback);
            });
};

/**
 *
 * @param {type} imageB64 Image to be check in base64
 * @param {type} callback (error, emotionJsonString)
 * @returns {undefined}
 */
Oxford.prototype.recognizeImageB64 = function (imageB64, callback) {
        var self = this;
        var buf = Buffer(imageB64, 'base64');
        return self._getEmotion(buf, callback);
};

Oxford.prototype.printSomething = function (){
    return "Something from Oxford";
};

/*!
 * The exports object is an instance of Oxford.
 *
 * @api public
 */

var oxford = module.exports = exports = new Oxford;

