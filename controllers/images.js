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

/**
 * Checks wether a request to the addImage API is valid
 * @param {type} request HTTP request
 * @returns {Boolean}
 */
function _checkRequest (request)
{
    if (!request) {
        return false;
    }
    
    if (request.method !== 'POST') {
        return false;
    }
    
    if (request.get('Content-Type') !== 'application/json') {
        return false;
    }
    
    var existsUsername = request.body.username;
    var existsImage = request.body.image;
    
    if (!existsImage || !existsUsername) {
        return false;
    }
    
    return true;
}

exports._checkRequest = _checkRequest;

/**
 * Receives a HTTP Request with an image and stores it in the DB.
 * If oxfordLib is down then the image is stored without info of the emotion
 * @param {type} req - HTTP request with the image
 * @param {type} res - HTTP Response to use
 * @returns {undefined}
 */
exports.addImage = function(req, res) {
    var validRequest = _checkRequest(req);
    
    if (!validRequest) {
        console.log("addImage: Invalid request");
        res.status(400).send("Invalid request");
        return;
    }
    
    console.log("addImage: Petition from: " + req.ip + ". Username: " + req.body.username);

    Oxfordlib.recognizeImageB64(req.body.image, function(error, emotions){
        
        var store;
        
        if (error) {
            console.log ("addImage: ERROR: " + error);
            
            //Failure in connection with Oxford API: Setup to store without emotions
            var store = new Image({
                username:    req.body.username,
                ip:          req.ip,
                date:        new Date(),
                image: 	     req.body.image,
            });
            
        } else {
            //Extract main emotion
            var mainEmotionObj = Oxfordlib.extractMainEmotion(emotions);

            if(mainEmotionObj === Oxfordlib.emptyEmotion){
                console.log("addImage: No emotion detected");
                res.status(400).send("No emotion detected in this image");
                return;
            }

            var mainEmotion = mainEmotionObj.emotion;

            console.log("addImage: Image recognition: " + mainEmotion + " (" + emotions + ")");

            var store = new Image({
                username:    req.body.username,
                ip:          req.ip,
                date:        new Date(),
                image:       req.body.image,
                emotions:    emotions,
                mainemotion: mainEmotion
            });
        }

        store.save(function(error, store) {
            if (error) {
                res.status(500).send(error.message);
            } else {
                res.status(200).send("Image stored correctly");
            }
        });
    });

};

exports.addFieldToImage = function(imageId, newFieldKey, newFieldValue, callback) {
    console.log("addFieldToImage newFieldKey: " + newFieldKey);
    console.log("addFieldToImage newFieldValue: " + newFieldValue);

    //We must test if the problem was the type of the id
    //var id = require('mongoose').Types.ObjectId(imageId);

    Image.update({ _id: imageId }, { $set: { newFieldKey: newFieldValue }}, function(err, numberAffected) {
        if (err) {
            console.log(err);
        } else {
            console.log("Image " + imageId + " updated: " + numberAffected);
        }
    });

};

exports.updateField = function (imageid, fieldKey, newValue, callback){

    Image.update({ _id: imageid }, { $set: { fieldKey: newValue }}, function(err, numberAffected){
        if(err){
            console.log(err);
        } else {
            console.log("Image " + id + " updated: " + numberAffected);
        }
        callback(err, numberAffected);
    });

};


