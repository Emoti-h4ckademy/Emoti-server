/**
 * Images constructor
 * 
 * The exports object of the "images" module is an instance of this class.
 * Most apps will only use this one instance.
 */
function Images (imageModelPath) {
    imageModelPath = imageModelPath || '../models/image';
    this.imageDB = require(imageModelPath);
    this.oxfordLib = require('../lib/oxford');
}

/**
 * Checks wether a document has all the emotion stored and, if not, tries to access them
 * If there aren't any faces/emotions in the image the document will be drop from the DB
 * It there are emotion, the document will be updated in the DB
 * @param {type} document As retrieved from the DB
 * @param {type} callback - Function to callback (error, newImage)
 * @returns {undefined}
 */
Images.prototype.checkDocument = function (document, callback) {
    if (!document || !document._doc) {
        callback ("Invalid document", undefined); 
        return;
    }
    
    var extractedImage = document._doc;
    if (extractedImage.mainemotion && extractedImage.emotions) {
        callback (false, extractedImage);
        return;
    }
    
    this.oxfordLib.recognizeImageB64(extractedImage.image, function(error, emotions){
        if (error) {
            console.log ("checkDocument: ERROR WITH OXFORD: " + error);
            callback (true, extractedImage);
        }
        
        var mainEmotionObj = this.oxfordLib.extractMainEmotion(emotions);
        if(mainEmotionObj == this.oxfordLib.emptyEmotion){
            this.imageDB.findByIdAndRemove(
                {'_id': extractedImage._id},
                {},
                function (error, result) {
                    console.log("checkDocument: No emotion detected - ID ("+ extractedImage._id +") DELETED FROM DATABASE. Error: "+ error);
                }
            );
            callback (true, undefined);
            return;
        }
        
        //Update the image in the DB with emotions
        var mainEmotion = mainEmotionObj.emotion;
        this.imageDB.findOneAndUpdate(
            {'_id': extractedImage._id}, 
            { $set: { emotions: emotions, mainemotion: mainEmotion}},
            {new: true},
            function (error, result) {
                console.log("checkDocument: Emotion detected " + mainEmotion + "- ID ("+ extractedImage._id +") UPDATED IN DATABASE. Error: "+ error);
                callback (false, result);
                return;
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
Images.prototype.updateImagesWithoutEmotions = function (queryLimit, callback) {
    this.imageDB.find(
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
Images.prototype.getImagesStoredWithEmotions = function(queryLimit, callback) {
    this.imageDB.find(
        {"mainemotion" : { "$exists" : true }},
        {},
        { limit : queryLimit },
        function (err, images) {
            callback(err, images);
        }
    );
};

/**
 * Checks wether a request to the addImage function is valid
 * @param {type} request HTTP request
 * @returns {Boolean}
 */
Images.prototype._checkRequest = function (request)
{
    if ((!request) ||
        (request.method !== 'POST') ||
        (request.get('Content-Type') !== 'application/json')) {
        return false;
    }
    
    var existsUsername = request.body.username;
    var existsImage = request.body.image;
    if (!existsImage || !existsUsername) {
        return false;
    }
    
    return true;
}

/**
 * Receives a HTTP Request with an image and stores it in the DB.
 * If oxfordLib is down then the image is stored without info of the emotion
 * @param {type} req - HTTP request with the image
 * @param {type} res - HTTP Response to use
 * @returns {undefined}
 */
Images.prototype.addImage = function(req, res) {
    var validRequest = this._checkRequest(req);
    
    if (!validRequest) {
        console.log("addImage: Invalid request");
        res.status(400).send("Invalid request");
        return;
    }
    
    console.log("addImage: Petition from: " + req.ip + ". Username: " + req.body.username);

    this.oxfordLib.recognizeImageB64(req.body.image, function(error, emotions){
        
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
            var mainEmotionObj = this.oxfordLib.extractMainEmotion(emotions);

            if (mainEmotionObj === this.oxfordLib.emptyEmotion) {
                console.log("addImage: No emotion detected");
                res.status(400).send("No emotion detected in this image");
                return;
            }

            var mainEmotion = mainEmotionObj.emotion;

            console.log("addImage: Image recognition: " + mainEmotion + " (" + emotions + ")");

            store = new this.imageDB({
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

Images.prototype.getImageByMonth = function (month, callback) {
    this.imageDB.find({'date' : {'$gte': new Date(2015, month, 1), '$lt': new Date(2015, month + 1, 3)}},
        'username mainemotion emotions date',
        {$sort: { 'date' : 'ascending' } },function (err, images) {
        console.log("Number of images: " + images) // Space Ghost is a talk show host.
        callback(err, images);
    });
};

/*!
 * The exports object is an instance of Oxford.
 */
var images = module.exports = exports = new Images;