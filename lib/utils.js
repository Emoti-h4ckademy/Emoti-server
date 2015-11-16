/**
 * Created by Carlos on 10/11/15.
 */
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

        var clientId = 'test-app';                             // Can be anything
        var clientSecret = '16aa2bca699c43f6a91847bbbfd9d5c1'; // API key from Azure marketplace


        var oxfordEmotion = require("node-oxford-emotion")(clientSecret);
        var Image  = require('mongoose').model('Image');
        Image.findOne(function (err, image) {
            if (err) throw err;
            if(!image) throw new Error("No image found in database");
            if (image.image) {
                var emotion = oxfordEmotion.recognize("image", new Buffer(image.image,'base64'), function(cb) {
                    console.log("Emotions recognized by Oxford:");
                    console.log(cb);
                });
            }
        });



    }
}