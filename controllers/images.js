/**
 * Created by Carlos on 6/11/15.
 */
var Image = require('mongoose').model('Image');
var Oxfordlib = require('../lib/oxford');

/**
 * Checks wether a document has all the emotion stored and, if not, tries to access them
 * If there aren't any faces/emotions in the image the document will be drop from the DB
 * It there are emotion, the document will be updated in the DB
 * @param {type} document As retrieved from the DB
 * @param {type} callback - Function to callback (error, newImage)
 * @returns {undefined}
 */
exports.checkDocument = function (document, callback) {
    
    var extractedImage = document._doc;
    if (extractedImage.mainemotion) {
        callback (false, extractedImage);
    }
    
    Oxfordlib.recognizeImageB64(extractedImage.image, function(error, emotions){
        if (error) {
            console.log ("checkDocument: ERROR WITH OXFORD: " + error);
            callback (true, extractedImage);
        }
        
        var mainEmotionObj = Oxfordlib.extractMainEmotion(emotions);
        if(mainEmotionObj == Oxfordlib.emptyEmotion){
            Image.findByIdAndRemove(
                {'_id': extractedImage._id},
                {},
                function (error, result) {
                    console.log("checkDocument: No emotion detected - ID ("+ extractedImage._id +") DELETED FROM DATABASE. Error: "+ error);
                }
            );
            callback (true, undefined);
        }
        
        //Update the image in the DB with emotions
        var mainEmotion = mainEmotionObj.emotion;
        Image.findOneAndUpdate(
            {'_id': extractedImage._id}, 
            { $set: { emotions: emotions, mainemotion: mainEmotion}},
            {new: true},
            function (error, result) {
                console.log("checkDocument: Emotion detected " + mainEmotion + "- ID ("+ extractedImage._id +") UPDATED IN DATABASE. Error: "+ error);
                return (false, result);
            }
        );
        
    });
}

/**
 * 
 * @param {type} queryLimit
 * @param {type} callback
 * @returns {undefined}
 */
exports.updateImagesWithoutEmotions = function (queryLimit, callback) {
    Image.find(
        {"mainemotion" : { "$exists" : false }},
        {},
        { limit : queryLimit },
        function (err, documents) {
            if (!err) {
                for (var iterator = 0; iterator < documents.length; iterator++) {
                    checkDocument(documents[iterator]);
                }
            }

            callback (err, documents);
        }
    );
}

/**
 * 
 * @param {type} queryLimit
 * @param {type} callback
 * @returns {undefined}
 */
exports.getImagesStoredWithEmotions = function(queryLimit, callback) {
    Image.find(
        {"mainemotion" : { "$exists" : true }},
        {},
        { limit : queryLimit },
        function (err, images) {
            callback(err, images);
        }
    );
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
            store = new Image({
                username:    req.body.username,
                ip:          req.ip,
                date:        new Date(),
                image: 	     req.body.image,
            });
            
        } else {
            //Extract main emotion
            var mainEmotionObj = Oxfordlib.extractMainEmotion(emotions);

            if (mainEmotionObj === Oxfordlib.emptyEmotion) {
                console.log("addImage: No emotion detected");
                res.status(400).send("No emotion detected in this image");
                return;
            }

            var mainEmotion = mainEmotionObj.emotion;

            console.log("addImage: Image recognition: " + mainEmotion + " (" + emotions + ")");

            store = new Image({
                username:    req.body.username,
                ip:          req.ip,
                date:        new Date(),
                image:       req.body.image,
                emotions:    emotions,
                mainemotion: mainEmotion
            });

            store.save(function (error, store) {
                if (error) {
                    res.status(500).send(error.message);
                } else {
                    res.status(200).send("Image stored correctly");
                }
            });
        }
    });

};

exports.addMockImage = function (mockImage, callback){
    if(mockImage == undefined) {
        callback(new Error("A valid Mock Image must be passed as an argument"), store);
    } else {
        var store = new Image({
            username:    mockImage.username,
            ip:          mockImage.ip,
            date:        mockImage.date,
            image:       mockImage.image,
            emotions:    mockImage.emotions,
            mainemotion: mockImage.mainemotion
        });

        store.save(function (error, store) {
            callback(error, store);
        });
    }
};


