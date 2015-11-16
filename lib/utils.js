/**
 * Created by Carlos on 10/11/15.
 */

function emotionExtraction (imageB64, cb){
    var clientId = 'test-app';                             // Can be anything
    var clientSecret = 'clave api'; // API key from Azure marketplace

    var oxfordEmotion = require("node-oxford-emotion")(clientSecret);
    var buf = Buffer(imageB64, 'base64');
    return oxfordEmotion.recognize("image", buf, cb);
}
//
module.exports = {

    registerModels: function(app, mongoose){
        console.log('utils.js: Registering models');

        require('../models/image')(app, mongoose);

        console.log("utils.js: 'Image' model registered");
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
                var emotion = emotionExtraction(image.image, function (res) {
                    console.log(res);
                });
            }
        });
    }

}