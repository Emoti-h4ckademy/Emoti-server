/**
 * Created by Carlos on 6/11/15.
 */
var Image = require('mongoose').model('Image');
var Oxfordlib = require('../lib/oxford');

//GET - Return all images in the DB
exports.findAllImages = function(req, res) {
    Image.find(function(err, images) {
        if(err) res.send(500, err.message);

        console.log('GET /images')
        res.status(200).jsonp(images);
    });
};

exports.returnAllImages = function(callback) {
    Image.find(function(err, images) {
       /*if (err) {
            throw Error;
       }*/
        callback(err, images);
    });
};

exports.returnOneImage = function(callback) {
    Image.findOne(function(err, images) {
        /*if (err) {
         throw Error;
         }*/
        callback(err, images);
    });
};

exports.findOneImage = function(req, res) {
    Image.findOne(function(err, images) {
        if(err) res.send(500, err.message);

        console.log('GET /images')
        res.status(200).jsonp(images);
    });
};

/*
//GET - Return an image with specified ID
exports.findImageById = function(req, res) {
    Image.findById(req.params.id, function(err, image) {
        if(err) return res.send(500, err.message);

        console.log('GET /images/' + req.params.id);
        res.status(200).jsonp(image);
    });
};*/

//POST - Insert a new image in the DB
exports.addImage = function(req, res) {
    console.log('addImage');
    console.log("Petition from: " + req.ip + ". Username: " + req.body.username);
    
    Oxfordlib.recognizeImageB64(req.body.image, function(error, emotions){
        var mainEmotion = Oxfordlib.extractMainEmotion(emotions).emotion;
        console.log("Emotion for this image: " + mainEmotion);
        console.log("Image recognition: Error = " + error + "; Emotions: " + emotions);
        
        var store = new Image({
            username:    req.body.username,
            ip:          req.ip,
            date:        new Date(),
            image: 	     req.body.image,
            emotions:    emotions,
            mainemotion: mainEmotion
        });
        
        store.save(function(err, store) {
            if (err) {
                res.send(500, err.message);
            } else {
                res.status(200).send("Image saved");
        }
    });
        
    });

};

