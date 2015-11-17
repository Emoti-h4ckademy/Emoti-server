/**
 * Created by Carlos on 10/11/15.
 */

var utils = module.exports = {

    registerModels: function(app, mongoose){
        console.log('utils.js: Registering models');

        require('../models/image')(app, mongoose);

        console.log("utils.js: 'Image' model registered");
    },

    getEmotionReponseFromOxford: function (imageB64, callback){
        try {
            var config = require('config');
            var apiKey = config.get('emotionAPIKey');
        }
        catch (e) {
            console.log("Couldn't load Oxford Service settings file");
            console.log(e);
        }

        var oxfordEmotion = require("node-oxford-emotion")(apiKey);
        var buf = Buffer(imageB64, 'base64');
        return oxfordEmotion.recognize("image", buf, callback);
    },

    getEmotion: function(imageid, callback){

    },

    detectEmotion: function (imageid, callback){
        console.log("Imageid from client: " + imageid);
        callback(null, {emotion: "happy", coef: 0.89786696});
    },
    
    testOxfordAPI: function (){
        var fs = require('fs');
        var util = require('util');
        var request = require('request');

        var Image  = require('mongoose').model('Image');
        Image.findOne(function (err, image) {
            if (err) throw err;
            if(!image) throw new Error("No image found in database");
            if (image.image) {
                var emotion = utils.emotionDetect(image.image, function (res) {
                    console.log(res);
                });
            }
        });
    }

}