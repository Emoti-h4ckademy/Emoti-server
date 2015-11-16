/**
 * Created by Carlos on 10/11/15.
 */

var utils = module.exports = {

    registerModels: function(app, mongoose){
        console.log('utils.js: Registering models');

        require('../models/image')(app, mongoose);

        console.log("utils.js: 'Image' model registered");
    },

    emotionDetect: function (imageB64, cb){
        var clientSecret = 'clave api'; // API key from Azure marketplace

        var oxfordEmotion = require("node-oxford-emotion")(clientSecret);
        var buf = Buffer(imageB64, 'base64');
        return oxfordEmotion.recognize("image", buf, cb);
    },

    detectEmotion: function (imageid, callback){
        console.log("Imageid from client: " + imageid);
        callback(null, 'happy');
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