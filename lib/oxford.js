var config = require('config');
var request = require('request');

var oxford = exports.module = {

    /**
     * Parses the response of the Oxford API returning to check for errors
     * @param {type} response - Response from the API
     * @param {type} callback - Function to be callback
     *      1st param will be error
     *      2nd parameter will be the emotion array
     * @returns {undefined}
     */
    oxfordParseResponse : function (response, callback) {
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
    oxfordPost : function (image, callback) {
    
        //API setup
        var oxfordApiKey = config.get('emotionAPIKey');
        var oxfordUrl = config.get('emotionURL');
        var oxfordContentType = "application/octet-stream";


        request({
            url: oxfordUrl,
            method: "POST",
            json: false,
            body: image,
            headers: {
                    "content-type" : oxfordContentType,
                    "Ocp-Apim-Subscription-Key" : oxfordApiKey
                }
            }, function (error, response, body) {
                oxford.oxfordParseResponse(response, callback);
            });
    },

    /**
     * 
     * @param {type} imageB64 Image to be check in base64
     * @param {type} callback (error, emotionJsonString)
     * @returns {undefined}
     */
    recognizeImageB64: function (imageB64, callback) {
        var buf = Buffer(imageB64, 'base64');
        return oxford.oxfordPost(buf, callback);
    }
}

